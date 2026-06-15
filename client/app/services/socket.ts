import { createStore } from "jotai";
import {
  wsConnectionAtom,
  currentPlayerAtom,
  otherPlayersAtom,
  useGameStore,
  cleanupPlayerMessages,
  addChatMessageAtom,
  setRockReactionAtom,
  pendingInteractionAtom,
  interactionDialogVisibleAtom,
  interactionTimeoutAtom,
  addEventAlertAtom,
  activeInteractionFamily,
  selectedPlayerProfileAtom,
  playerProfileSheetAtom,
  updateInteractionCooldownAtom,
  friendsAtom,
} from "~/store";
import {
  type ChatMessage,
  EventType,
  PassportRarity,
  PlayerHat,
  type PlayerProfile,
  PlayerSkin,
  type PlayerState,
} from "~/types";
import { ROCK_URL } from "~/config/constants";
import { miniapp } from "./miniapp";
import { getDefaultUnlockedHats } from "~/config/hats";
import { getDefaultUnlockedSkins } from "~/config/skins";
import type {
  InteractionBaseData,
  InteractionPerformedData,
  InteractionRequestData,
  ManageFriendRequestData,
  ManagePlayerBlockData,
  RockRenameData,
} from "~/types/socket";
import { getInteractionEmoji, getInteractionLabel } from "~/config/interaction";
import {
  loadPlayerStyle,
  savePlayerStyle,
  takePendingPlayerStyle,
  type StoredPlayerStyle,
} from "./player-style";

type RockPacket =
  | { t: "world"; d: WorldSnapshot }
  | { t: "signal"; d: SignalPacket }
  | { t: "system"; d: unknown };

type EntityPayload = {
  position?: { x: number; y: number };
  name?: string;
  owned_by?: number;
  custom?: Record<string, any>;
};

type RoomSnapshot = {
  spawn?: Record<string, EntityPayload>;
  update?: Record<string, EntityPayload>;
  state?: Record<string, unknown>;
};

type WorldSnapshot = {
  tick: number;
  rooms: Record<string, RoomSnapshot>;
  despawn?: number[];
};

type SignalPacket = {
  name?: string;
  data?: any;
};

const defaultJoystick = {
  type: "stop",
  x: 0,
  y: 0,
  direction: null,
  distance: 0,
};

const buildWsUrl = (token: string | null) => {
  const url = new URL(ROCK_URL);
  if (token) {
    url.searchParams.set("auth", "farcaster");
    url.searchParams.set("token", token);
  }
  return url.toString();
};

const sendPacket = (socket: WebSocket | null, packet: unknown) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify(packet));
  return true;
};

const readCustom = (entity?: EntityPayload) => entity?.custom ?? {};
const renderText = (text: unknown): string =>
  typeof text === "string" ? text.replace(/<3/g, "❤️") : "";

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private store: ReturnType<typeof createStore>;
  private isConnecting = false;
  private currentFid: number | null = null;
  private currentRoom = "village_1";
  private entities = new Map<string, EntityPayload>();
  private entityToFid = new Map<string, number>();
  private playerEntityByFid = new Map<number, string>();
  private rockEntityByFid = new Map<number, string>();
  private lastMoveSentAt = 0;
  private lastPosition: PlayerState["position"] | null = null;
  private suppressMoveUntil = 0;
  private pendingStyle: { hat?: PlayerHat; skin?: PlayerSkin } | null = null;

  constructor(store: ReturnType<typeof createStore>) {
    this.store = store;
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  async connect() {
    if (this.isConnecting || this.isConnected()) return;
    this.isConnecting = true;
    this.currentFid = null;
    this.entities.clear();
    this.entityToFid.clear();
    this.playerEntityByFid.clear();
    this.rockEntityByFid.clear();
    this.lastPosition = null;
    this.pendingStyle = null;
    this.store.set(otherPlayersAtom, new Map());

    const token = await miniapp.quickAuthToken();
    const socket = new WebSocket(buildWsUrl(token));
    this.socket = socket;

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      socket.onopen = () => {
        settled = true;
        this.isConnecting = false;
        this.store.set(wsConnectionAtom, socket);
        resolve();
      };

      socket.onerror = () => {
        this.isConnecting = false;
        if (!settled) {
          settled = true;
          reject(new Error("ROCK WebSocket connection failed"));
        }
      };

      socket.onclose = (event) => {
        this.isConnecting = false;
        if (this.socket === socket) {
          this.socket = null;
          this.store.set(wsConnectionAtom, null);
        }
        if (!settled) {
          settled = true;
          reject(
            new Error(
              `ROCK WebSocket closed before open: code=${event.code}, reason=${event.reason || "none"}`,
            ),
          );
        }
      };

      socket.onmessage = (event) => this.handleMessage(event.data);
    });
  }

  private handleMessage(raw: string) {
    let packet: RockPacket;
    try {
      packet = JSON.parse(raw) as RockPacket;
    } catch (error) {
      console.warn("Failed to parse ROCK packet", error);
      return;
    }

    if (packet.t === "world") {
      this.handleWorld(packet.d);
    } else if (packet.t === "signal") {
      this.handleSignal(packet.d);
    } else if (packet.t === "system") {
      console.log("ROCK system packet", packet.d);
    }
  }

  private handleWorld(snapshot: WorldSnapshot) {
    for (const id of snapshot.despawn ?? []) {
      this.removeEntity(String(id));
    }

    for (const room of Object.values(snapshot.rooms)) {
      for (const [id, entity] of Object.entries(room.spawn ?? {})) {
        this.mergeEntity(id, entity);
      }

      for (const [id, entity] of Object.entries(room.update ?? {})) {
        this.mergeEntity(id, entity);
      }
    }

    this.syncPlayersFromEntities();
  }

  private mergeEntity(id: string, patch: EntityPayload) {
    const prev = this.entities.get(id) ?? {};
    const merged: EntityPayload = {
      ...prev,
      ...patch,
      custom: {
        ...(prev.custom ?? {}),
        ...(patch.custom ?? {}),
      },
    };

    this.entities.set(id, merged);

    const custom = readCustom(merged);
    const fid = Number(custom.fid);
    if (!Number.isFinite(fid) || fid <= 0) return;

    this.entityToFid.set(id, fid);
    if (custom.kind === "player") {
      this.playerEntityByFid.set(fid, id);
    } else if (custom.kind === "rock") {
      this.rockEntityByFid.set(fid, id);
    }
  }

  private removeEntity(id: string) {
    const fid = this.entityToFid.get(id);
    this.entities.delete(id);
    this.entityToFid.delete(id);

    if (!fid) return;

    if (this.playerEntityByFid.get(fid) === id) {
      this.playerEntityByFid.delete(fid);
      this.removePlayer(fid);
    }

    if (this.rockEntityByFid.get(fid) === id) {
      this.rockEntityByFid.delete(fid);
    }
  }

  private buildProfile(fid: number): PlayerProfile | null {
    const playerEntity = this.entities.get(this.playerEntityByFid.get(fid) ?? "");
    if (!playerEntity) return null;

    const player = readCustom(playerEntity);
    const rockEntity = this.entities.get(this.rockEntityByFid.get(fid) ?? "");
    const rock = readCustom(rockEntity);

    return {
      id: String(fid),
      fid,
      username: player.username || `user${fid}`,
      displayName: player.displayName || player.username || `User ${fid}`,
      pfpUrl: player.pfpUrl || "",
      petRock: {
        id: rock.id || `rock:${fid}`,
        userId: String(fid),
        name: rock.rockName || rock.name || "Rocky",
        age: Number(rock.age ?? 0),
        happiness: Number(rock.happiness ?? 100),
        createdAt: new Date(),
        updatedAt: new Date(),
        passport: rock.passportMinted
          ? {
              id: `passport:${fid}`,
              rockId: rock.id || `rock:${fid}`,
              rarity: (rock.passportRarity ||
                PassportRarity.COMMON) as PassportRarity,
              name: rock.passportName || rock.rockName || "Rocky",
              traits: [],
              preferences: {
                music: "",
                food: "",
                activity: "",
                season: "",
                timeOfDay: "",
                scent: "",
              },
              issuedAt: new Date(),
              changedName: Boolean(rock.passportChangedName),
            }
          : undefined,
      },
      isConnected: Boolean(player.isConnected ?? true),
      isInteracting: Boolean(player.isInteracting ?? false),
      isAnonymous: Boolean(player.isAnonymous),
      lastUpdate: Date.now(),
      skin: (player.skin || PlayerSkin.SEAL) as PlayerSkin,
      unlockedSkins: (player.unlockedSkins ||
        getDefaultUnlockedSkins()) as PlayerSkin[],
      hat: (player.hat || PlayerHat.NONE) as PlayerHat,
      unlockedHats: (player.unlockedHats ||
        getDefaultUnlockedHats()) as PlayerHat[],
      relationships: {},
    };
  }

  private buildState(fid: number): PlayerState | null {
    const playerEntity = this.entities.get(this.playerEntityByFid.get(fid) ?? "");
    if (!playerEntity?.position) return null;

    const player = readCustom(playerEntity);
    const rockEntity = this.entities.get(this.rockEntityByFid.get(fid) ?? "");
    const rock = readCustom(rockEntity);

    return {
      position: {
        x: playerEntity.position.x,
        y: Number(player.y ?? 4),
        z: playerEntity.position.y,
      },
      rotation: {
        x: Number(player.rotationX ?? 0),
        y: Number(player.rotationY ?? 0),
        z: Number(player.rotationZ ?? 0),
        w: Number(player.rotationW ?? 1),
      },
      rockPosition: {
        x: rockEntity?.position?.x ?? playerEntity.position.x + 2,
        y: Number(rock.y ?? 4),
        z: rockEntity?.position?.y ?? playerEntity.position.y,
      },
      rockRotation: {
        x: Number(rock.rotationX ?? 0),
        y: Number(rock.rotationY ?? 0),
        z: Number(rock.rotationZ ?? 0),
        w: Number(rock.rotationW ?? 1),
      },
      joystick: {
        type: player.joystickType ?? defaultJoystick.type,
        x: Number(player.joystickX ?? defaultJoystick.x),
        y: Number(player.joystickY ?? defaultJoystick.y),
        direction: player.joystickDirection ?? defaultJoystick.direction,
        distance: Number(player.joystickDistance ?? defaultJoystick.distance),
      } as any,
    };
  }

  private syncPlayersFromEntities() {
    const gameStore = useGameStore.getState();
    const others = new Map(this.store.get(otherPlayersAtom));
    const currentPlayer = this.store.get(currentPlayerAtom);

    for (const fid of this.playerEntityByFid.keys()) {
      const profile = this.buildProfile(fid);
      const state = this.buildState(fid);
      if (!profile || !state) continue;

      if (fid === this.currentFid || fid === currentPlayer?.fid) {
        others.delete(profile.id);

        if (!gameStore.getPlayerState(profile.id)) {
          gameStore.updatePlayerState(profile.id, state);
        }

        const currentProfile = this.pendingStyle
          ? { ...profile, ...this.pendingStyle }
          : profile;

        this.store.set(currentPlayerAtom, {
          ...(this.store.get(currentPlayerAtom) ?? currentProfile),
          ...currentProfile,
        });
      } else {
        gameStore.updatePlayerState(profile.id, state);

        others.set(profile.id, {
          ...(others.get(profile.id) ?? profile),
          ...profile,
        });
      }
    }

    this.store.set(otherPlayersAtom, others);
  }

  private removePlayer(fid: number) {
    const id = String(fid);
    const others = new Map(this.store.get(otherPlayersAtom));
    others.delete(id);
    this.store.set(otherPlayersAtom, others);
    cleanupPlayerMessages(fid);
    useGameStore.getState().removePlayer(id);
  }

  private handleSignal(signal: SignalPacket) {
    const name = signal.name;
    const data = signal.data ?? {};

    switch (name) {
      case "Identity": {
        this.currentFid = Number(data.fid);
        this.currentRoom = data.room || this.currentRoom;
        break;
      }
      case "RoomJoin": {
        this.currentRoom = data.room || this.currentRoom;
        if (data.player) {
          this.currentFid = Number(data.player.fid);
          this.setJoinedPlayer(data.player, data.rock);
        }
        break;
      }
      case "PlayerJoined": {
        if (!data.player || Number(data.player.fid) === this.currentFid) break;
        const others = new Map(this.store.get(otherPlayersAtom));
        const profile = this.profileFromSignal(data.player, data.rock);
        others.set(profile.id, profile);
        this.store.set(otherPlayersAtom, others);
        this.store.set(addEventAlertAtom, {
          type: EventType.PLAYER_JOINED,
          message: `${profile.username} joined the world`,
        });
        break;
      }
      case "PlayerLeft": {
        this.removePlayer(Number(data.fid));
        break;
      }
      case "ChatMessage": {
        const message = data.message as ChatMessage | undefined;
        if (message) {
          this.store.set(addChatMessageAtom, {
            ...message,
            message: renderText(message.message),
          });
        }
        break;
      }
      case "PlayerStyleUpdate": {
        this.applyStyleUpdate(Number(data.fid), data.skin, data.hat);
        break;
      }
      case "RockTalk": {
        this.store.set(setRockReactionAtom, {
          fid: Number(data.fid),
          message: renderText(data.rockMessage),
          isBouncing: Boolean(data.isBouncing),
        });
        break;
      }
      case "RockUpdate": {
        this.applyRockUpdate(Number(data.fid), data.rock ?? {});
        break;
      }
      case "RockRename": {
        this.applyRockRename(data as RockRenameData);
        break;
      }
      case "InteractionRequest": {
        this.handleInteractionRequest(data as InteractionRequestData);
        break;
      }
      case "InteractionPerform": {
        this.handleInteractionPerform(data as InteractionPerformedData);
        break;
      }
      case "InteractionReject": {
        this.handleInteractionReject(data);
        break;
      }
      case "InteractionRejected": {
        this.store.set(addEventAlertAtom, {
          type: EventType.INTERACTION_REJECTED,
          message: "interaction rejected",
        });
        break;
      }
      default:
        console.log("Unhandled ROCK signal", name, data);
    }
  }

  private setJoinedPlayer(player: any, rock: any) {
    const profile = this.profileFromSignal(player, rock);
    const pendingStyle = takePendingPlayerStyle();
    const anonymousStyle = profile.isAnonymous ? loadPlayerStyle() : null;
    const style = pendingStyle ?? anonymousStyle;

    if (style && this.isStyleChanged(profile, style)) {
      this.pendingStyle = style;

      this.store.set(currentPlayerAtom, {
        ...profile,
        skin: style.skin ?? profile.skin,
        hat: style.hat ?? profile.hat,
      });
      this.changeStyle(style);
      return;
    }

    this.store.set(currentPlayerAtom, profile);
  }

  private isStyleChanged(profile: PlayerProfile, style: StoredPlayerStyle) {
    return (
      (style.skin !== undefined && style.skin !== profile.skin) ||
      (style.hat !== undefined && style.hat !== profile.hat)
    );
  }

  private profileFromSignal(player: any, rock: any): PlayerProfile {
    return {
      id: String(player.id ?? player.fid),
      fid: Number(player.fid),
      username: player.username || `user${player.fid}`,
      displayName: player.displayName || player.username || `User ${player.fid}`,
      pfpUrl: player.pfpUrl || "",
      petRock: {
        id: rock?.id || `rock:${player.fid}`,
        userId: String(player.fid),
        name: rock?.name || "Rocky",
        age: Number(rock?.age ?? 0),
        happiness: Number(rock?.happiness ?? 100),
        createdAt: new Date(),
        updatedAt: new Date(),
        passport: undefined,
      },
      isConnected: true,
      isInteracting: false,
      isAnonymous: Boolean(player.isAnonymous),
      lastUpdate: Date.now(),
      skin: (player.skin || PlayerSkin.SEAL) as PlayerSkin,
      unlockedSkins: player.unlockedSkins || getDefaultUnlockedSkins(),
      hat: (player.hat || PlayerHat.NONE) as PlayerHat,
      unlockedHats: player.unlockedHats || getDefaultUnlockedHats(),
      tag: player.tag,
      relationships: player.relationships || {},
    };
  }

  private applyStyleUpdate(fid: number, skin?: PlayerSkin, hat?: PlayerHat) {
    const apply = (profile: PlayerProfile) => ({
      ...profile,
      skin: skin ?? profile.skin,
      hat: hat ?? profile.hat,
    });
    const current = this.store.get(currentPlayerAtom);

    if (current?.fid === fid) {
      const updated = apply(current);
      this.store.set(currentPlayerAtom, updated);
      savePlayerStyle({ skin: updated.skin, hat: updated.hat });

      if (
        (!this.pendingStyle?.skin || this.pendingStyle.skin === updated.skin) &&
        (!this.pendingStyle?.hat || this.pendingStyle.hat === updated.hat)
      ) {
        this.pendingStyle = null;
      }

      return;
    }

    const others = new Map(this.store.get(otherPlayersAtom));
    const player = others.get(String(fid));
    if (player) {
      others.set(player.id, apply(player));
      this.store.set(otherPlayersAtom, others);
    }
  }

  private applyRockUpdate(fid: number, rockPatch: Record<string, unknown>) {
    const apply = (profile: PlayerProfile) => ({
      ...profile,
      petRock: { ...profile.petRock, ...rockPatch },
    });
    const current = this.store.get(currentPlayerAtom);

    if (current?.fid === fid) {
      this.store.set(currentPlayerAtom, apply(current));
      return;
    }

    const others = new Map(this.store.get(otherPlayersAtom));
    const player = others.get(String(fid));
    if (player) {
      others.set(player.id, apply(player));
      this.store.set(otherPlayersAtom, others);
    }
  }

  private applyRockRename(data: RockRenameData) {
    this.applyRockUpdate(Number(data.id), { name: data.name });
  }

  private handleInteractionRequest(data: InteractionRequestData) {
    const otherPlayers = this.store.get(otherPlayersAtom);
    const sourcePlayer = otherPlayers.get(data.sourceFid.toString());

    this.store.set(pendingInteractionAtom, {
      interactionId: data.interactionId,
      sourceFid: data.sourceFid,
      targetFid: data.targetFid,
      type: data.type,
      sourceUsername: sourcePlayer?.username || `Player ${data.sourceFid}`,
    });
    this.store.set(interactionDialogVisibleAtom, true);
    this.store.set(interactionTimeoutAtom, 30);
  }

  private handleInteractionPerform(data: InteractionPerformedData) {
    const { updatedRelationship, performedInteraction, updatedCooldown } = data;
    const currentPlayer = this.store.get(currentPlayerAtom);
    if (!currentPlayer) return;

    const sourceInteractionAtom = activeInteractionFamily(performedInteraction.sourceFid);
    const targetInteractionAtom = activeInteractionFamily(performedInteraction.targetFid);
    this.store.set(sourceInteractionAtom, performedInteraction);
    this.store.set(targetInteractionAtom, performedInteraction);

    const otherPlayerFid =
      performedInteraction.sourceFid === currentPlayer.fid
        ? performedInteraction.targetFid
        : performedInteraction.sourceFid;
    const otherPlayer = this.store.get(otherPlayersAtom).get(otherPlayerFid.toString());
    const otherUsername = otherPlayer?.username || `Player ${otherPlayerFid}`;

    this.store.set(addEventAlertAtom, {
      type: EventType.INTERACTION_ACCEPTED,
      message:
        performedInteraction.sourceFid === currentPlayer.fid
          ? `${otherUsername} accepted your ${getInteractionLabel(performedInteraction.type)}`
          : `you accepted ${otherUsername}'s ${getInteractionLabel(performedInteraction.type)}`,
      icon:
        performedInteraction.sourceFid === currentPlayer.fid
          ? undefined
          : getInteractionEmoji(performedInteraction.type),
    });

    this.store.set(updateInteractionCooldownAtom, updatedCooldown);
    this.store.set(currentPlayerAtom, {
      ...currentPlayer,
      relationships: {
        ...currentPlayer.relationships,
        [otherPlayerFid]: updatedRelationship,
      },
    });
  }

  private handleInteractionReject(data: InteractionBaseData) {
    const currentPlayer = this.store.get(currentPlayerAtom);
    const otherPlayers = this.store.get(otherPlayersAtom);
    if (data.sourceFid !== currentPlayer?.fid) return;

    const targetPlayer = otherPlayers.get(data.targetFid.toString());
    const targetUsername = targetPlayer?.username || `Player ${data.targetFid}`;
    this.store.set(addEventAlertAtom, {
      type: EventType.INTERACTION_REJECTED,
      message: `${targetUsername} declined your ${getInteractionLabel(data.type)}`,
    });
  }

  updatePosition(data: PlayerState, options: { force?: boolean } = {}) {
    const now = performance.now();
    if (
      !options.force &&
      (now < this.suppressMoveUntil || now - this.lastMoveSentAt < 50)
    ) {
      return;
    }

    this.lastPosition = data.position;
    this.lastMoveSentAt = now;

    this.sendSignal("PlayerMove", {
      position: data.position,
      rotation: data.rotation,
      rockPosition: data.rockPosition,
      rockRotation: data.rockRotation,
      joystick: data.joystick,
    });
  }

  suppressPositionUpdates(durationMs: number) {
    this.suppressMoveUntil = Math.max(
      this.suppressMoveUntil,
      performance.now() + durationMs,
    );
  }

  sendChatMessage(message: string) {
    if (!message.trim()) return;
    this.sendSignal("ChatMessage", { text: message.trim() });
  }

  petRock(data: {
    from: number;
    to: number;
    rubState: "start" | "end";
    duration: number;
    timestamp: number;
  }) {
    this.sendSignal("RockPet", data);
    if (data.rubState === "end") {
      this.store.set(addEventAlertAtom, {
        type: EventType.PET_ROCK_FED,
        message: "you petted your rock",
      });
    }
  }

  changeStyle(style: { hat?: PlayerHat; skin?: PlayerSkin }) {
    savePlayerStyle(style);
    this.pendingStyle = {
      ...(this.pendingStyle ?? {}),
      ...(style.hat === undefined ? {} : { hat: style.hat }),
      ...(style.skin === undefined ? {} : { skin: style.skin }),
    };
    this.sendSignal("StyleChange", style);
  }

  startInteraction(data: InteractionBaseData) {
    this.sendSignal("InteractionStart", data);
  }

  acceptInteraction(interactionId: string) {
    this.sendSignal("InteractionAccept", { interactionId });
    this.store.set(interactionDialogVisibleAtom, false);
    this.store.set(pendingInteractionAtom, null);
  }

  rejectInteraction(interactionId: string) {
    this.sendSignal("InteractionReject", { interactionId });
    this.store.set(interactionDialogVisibleAtom, false);
    this.store.set(pendingInteractionAtom, null);
  }

  mintPassport() {
    this.sendSignal("PassportMint", {});
  }

  renameRock(name: string) {
    this.sendSignal("RockRename", { name });
  }

  getFriendsList() {
    this.store.set(friendsAtom, []);
  }

  manageFriendRequest(_data: ManageFriendRequestData) {}
  managePlayerBlock(_data: ManagePlayerBlockData) {}
  removeFriend(_fid: number) {}
  inviteFriends(_data: { fids: number[] }) {}

  viewPlayerProfile({ fid }: { fid: number }) {
    const current = this.store.get(currentPlayerAtom);
    const player =
      current?.fid === fid
        ? current
        : this.store.get(otherPlayersAtom).get(fid.toString());

    if (player) {
      this.store.set(selectedPlayerProfileAtom, player);
      this.store.set(playerProfileSheetAtom, true);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.store.set(wsConnectionAtom, null);
  }

  private sendSignal(name: string, data: unknown) {
    sendPacket(this.socket, {
      t: "signal",
      d: { name, data },
    });
  }
}
