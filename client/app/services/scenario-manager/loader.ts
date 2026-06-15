import {
  ActorId,
  ActorType,
  PlayerSkin,
  type NpcId,
  type Player,
  type Scenario,
  type ScenarioActor,
  type ScenarioId,
} from "~/types";
import { scenarioRegistry } from "./registry";
import { currentPlayerAtom, clientStore, useGameStore } from "~/store";

const getPlayerSkinAvatar = (skin: PlayerSkin) => {
  switch (skin) {
    case PlayerSkin.SEAL:
      return "/avatars/seal.png";
    case PlayerSkin.DOG:
      return "/avatars/puppy.png";
    case PlayerSkin.STUMP_CHUM:
      return "/avatars/stump_chum.png";
    default:
      return null;
  }
};

const npcMetadata: Record<NpcId, ScenarioActor> = {
  [ActorId.TOWN_HALL_KITTY]: {
    id: ActorId.TOWN_HALL_KITTY,
    name: "Ms. Kitty",
    type: ActorType.NPC,
    position: [4005.5, 2.5, 4006],
    avatarUrl: "/avatars/ms_kitty.png",
  },
};

const actorResolver = {
  resolvePlayer: async (player: Player): Promise<ScenarioActor> => {
    return {
      id: ActorId.PLAYER,
      name: player.username,
      type: ActorType.PLAYER,
      position: [player.position.x, player.position.y, player.position.z],
      avatarUrl: getPlayerSkinAvatar(player.skin) ?? undefined,
    };
  },
  resolveNpc: async (id: NpcId): Promise<ScenarioActor> => {
    return npcMetadata[id];
  },
};

export const loadScenario = async (id: ScenarioId): Promise<Scenario> => {
  const definition = scenarioRegistry[id];
  if (!definition) {
    throw new Error(`Unknown scenario: ${id}`);
  }

  const playerProfile = clientStore.get(currentPlayerAtom);
  if (!playerProfile) {
    throw new Error("Player profile is not defined");
  }
  const playerState = useGameStore
    .getState()
    .getPlayerState(playerProfile.fid.toString()); // FIXME: fid.toString
  if (!playerState) {
    throw new Error("Player state is not defined");
  }

  const player = { ...playerProfile, ...playerState };
  const actors = await Promise.all(
    definition.requiredActors.map(({ id, type }) => {
      if (type === ActorType.PLAYER) {
        return actorResolver.resolvePlayer(player);
      } else if (type === ActorType.NPC) {
        if (id === ActorId.PLAYER) {
          throw new Error(`Invalid NPC ID: ${id}`);
        }

        return actorResolver.resolveNpc(id);
      }

      throw new Error(`Unknown actor: type ${type}, actor ID ${id}`);
    }),
  );

  return {
    ...definition.build({ actors, player }),
    state: {
      currentStep: 0,
      isPlaying: true,
      isPaused: false,
      isTypingComplete: false,
      selectedActionIndex: null,
    },
  };
};
