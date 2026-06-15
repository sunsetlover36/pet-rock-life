import { atom, type WritableAtom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import {
  PlayerSkin,
  PlayerHat,
  Screen,
  type ChatMessage,
  type PlayerProfile,
  type RockMessage,
  type InteractionAction,
  type EventAlert,
  type EventAlertInput,
  type InteractionCooldown,
  Area,
  type WorldMetadata,
  RelationshipType,
  type PlayerLocation,
  type Scenario,
  type ScenarioId,
  UIMode,
  UIComponent,
  type PerformedInteraction,
  type PendingInteraction,
  type Friend,
} from "~/types";
import * as THREE from "three";
import { WebSocketManager } from "~/services/socket";
import type { EffectComposer } from "postprocessing";

// Game state atoms - Internal socket storage
const _wsSocketAtom = atom<WebSocket | null>(null);
export const wsManagerAtom = atom<WebSocketManager | null>(null);

// Public reactive connection state atom
export const isConnectedAtom = atom(false);

// Combined atom for setting socket and updating connection state
export const wsConnectionAtom = atom(
  (get) => get(_wsSocketAtom),
  (get, set, socket: WebSocket | null) => {
    const prevSocket = get(_wsSocketAtom);

    if (prevSocket && prevSocket !== socket) {
      prevSocket.close();
    }

    set(_wsSocketAtom, socket);
    set(isConnectedAtom, socket?.readyState === WebSocket.OPEN);
  },
);

export const currentPlayerAtom = atom<PlayerProfile | null>(null);

export const previewSkinAtom = atom<PlayerSkin>(PlayerSkin.SEAL);
export const previewHatAtom = atom<PlayerHat>(PlayerHat.NONE);

export const interactionsDataAtom = atom<{
  interactions: InteractionAction[];
  cooldowns: InteractionCooldown[];
  relationshipLevels: Record<RelationshipType, number> | null;
}>({ interactions: [], cooldowns: [], relationshipLevels: null });
export const updateInteractionCooldownAtom = atom(
  null,
  (_, set, update: Partial<InteractionCooldown>) => {
    set(interactionsDataAtom, (interactionsData) => ({
      ...interactionsData,
      cooldowns: interactionsData.cooldowns.map((cooldown) => {
        if (cooldown.interactionType === update.interactionType) {
          return {
            ...cooldown,
            ...update,
          };
        }

        return cooldown;
      }),
    }));
  },
);

export const playerProfileSheetAtom = atom<boolean>(false);
export const selectedPlayerProfileAtom = atom<PlayerProfile | null>(null);

export const otherPlayersAtom = atom<Map<string, PlayerProfile>>(new Map());
export const rockNameAtom = atom<string>("");

const atomWithToggleAndStorage = (
  key: string,
  initialValue: boolean = false,
): WritableAtom<boolean, [boolean?], void> => {
  const baseAtom = atomWithStorage(key, initialValue);

  const toggleAtom = atom(
    (get) => get(baseAtom),
    (get, set, nextValue?: boolean) => {
      const update = nextValue ?? !get(baseAtom);
      set(baseAtom, update);
    },
  );

  return toggleAtom as WritableAtom<boolean, [boolean?], void>;
};
export const antialiasingAtom = atomWithToggleAndStorage("antialiasing");
export const pixelModeAtom = atomWithToggleAndStorage("pixel-mode");
export const newGraphicsSetAtom = atom<boolean>(false);

// Chat atoms
export const chatMessagesAtom = atom<ChatMessage[]>([]);
export const playerMessagesFamily = atomFamily(() => atom<ChatMessage[]>([]));
export const addChatMessageAtom = atom(null, (_, set, message: ChatMessage) => {
  if (!message) return;

  set(chatMessagesAtom, (prev) => [...prev, message]);

  const playerAtom = playerMessagesFamily(message.fid.toString());
  set(playerAtom, (prev) => [...prev, message]);
});
export const cleanupPlayerMessages = (fid: number) => {
  playerMessagesFamily.remove(fid);
};

export const rockReactionsAtom = atom<Map<number, RockMessage>>(new Map());
export const setRockReactionAtom = atom(
  null,
  (get, set, data: { fid: number; message: string; isBouncing: boolean }) => {
    if (!data) return;

    const { fid, message, isBouncing } = data;
    // Clear any existing timeout for this fid
    const existingReaction = get(rockReactionsAtom).get(fid);
    if (existingReaction?.timeoutId) {
      clearTimeout(existingReaction.timeoutId);
    }

    // Set new reaction with timeout
    const timeoutId = setTimeout(() => {
      set(rockReactionsAtom, (prev) => {
        const newMap = new Map(prev);
        newMap.delete(fid);
        return newMap;
      });
    }, 12000);

    set(rockReactionsAtom, (prev) => {
      const newMap = new Map(prev);
      newMap.set(fid, {
        message,
        timestamp: Date.now(),
        timeoutId,
        isBouncing,
      });
      return newMap;
    });
  },
);

export const chatInputAtom = atom<string>("");
export const isChatOpenAtom = atom<boolean>(false);

// Derived atoms
export const allPlayersAtom = atom((get) => {
  const currentPlayer = get(currentPlayerAtom);
  const otherPlayers = get(otherPlayersAtom);

  const allPlayers = new Map(otherPlayers);
  if (currentPlayer) {
    allPlayers.set(currentPlayer.id, currentPlayer);
  }

  return allPlayers;
});

export const oldVillageMaterialAtom = atom(new THREE.Material());
export const villageMaterialAtom = atom(new THREE.Material());
export const jumpTriggerAtom = atom(false);

export const uiModeAtom = atom<UIMode>(UIMode.MAIN_MENU);
export const uiComponentsAtom = atom<Record<UIComponent, boolean>>({
  [UIComponent.JOYSTICK]: true,
  [UIComponent.CHAT]: true,
  [UIComponent.PAUSE_BUTTON]: true,
});

// Modal atoms
export const modalVisibleAtom = atom<boolean>(false);
export const modalStateAtom = atom<{
  header: string;
  text: string;
}>({
  header: "",
  text: "",
});

export const currentScreenAtom = atom<Screen>(Screen.TAP_ANYWHERE);

// Interaction atoms
export const pendingInteractionAtom = atom<PendingInteraction | null>(null);
export const activeInteractionFamily = atomFamily(() =>
  atom<PerformedInteraction | null>(null),
);

export const interactionDialogVisibleAtom = atom<boolean>(false);
export const interactionTimeoutAtom = atom<number>(30);

// Event alerts atoms
export const eventAlertsAtom = atom<EventAlert[]>([]);

export const addEventAlertAtom = atom(
  null,
  (get, set, alertInput: EventAlertInput) => {
    const newAlert: EventAlert = {
      ...alertInput,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: alertInput.duration || 4000,
    };

    set(eventAlertsAtom, (prev) => {
      // Keep max 1 alerts, remove oldest if needed
      const alerts = [...prev, newAlert];
      return alerts.slice(-1);
    });

    // Auto-remove after duration
    setTimeout(() => {
      set(removeEventAlertAtom, newAlert.id);
    }, newAlert.duration);
  },
);

export const removeEventAlertAtom = atom(null, (get, set, alertId: string) => {
  set(eventAlertsAtom, (prev) => prev.filter((alert) => alert.id !== alertId));
});

// Camera animation atoms
export const cameraStateAtom = atom<{
  angle: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}>({
  angle: 0,
  position: new THREE.Vector3(),
  lookAt: new THREE.Vector3(),
});
export const cameraAnimPositionsAtom = atom<{
  startPosition: { x: number; y: number; z: number };
  startTarget: { x: number; y: number; z: number };
  endPosition: { x: number; y: number; z: number };
  endTarget: { x: number; y: number; z: number };
} | null>(null);
export const cameraAnimStateAtom = atom<{
  isAnimating: boolean;
  startTime: number;
  duration: number;
  phase: "zooming_in" | "holding" | "zooming_out";
  lerpLookAt?: boolean;
} | null>(null);

export const startCameraAnimationAtom = atom(
  null,
  (
    get,
    set,
    update: {
      startPosition: { x: number; y: number; z: number };
      startTarget: { x: number; y: number; z: number };
      endPosition: { x: number; y: number; z: number };
      endTarget: { x: number; y: number; z: number };
      duration: number;
      phase: "zooming_in" | "holding" | "zooming_out";
      lerpLookAt?: boolean;
    },
  ) => {
    const { duration, phase, lerpLookAt = true, ...positions } = update;
    set(cameraAnimStateAtom, {
      duration,
      phase,
      isAnimating: true,
      startTime: Date.now(),
      lerpLookAt,
    });
    set(cameraAnimPositionsAtom, positions);
  },
);

export const updateCameraAnimationPhaseAtom = atom(
  null,
  (
    get,
    set,
    update: {
      phase: "zooming_in" | "holding" | "zooming_out";
      duration: number;
      startTime?: number;
    },
  ) => {
    const current = get(cameraAnimStateAtom);
    if (current) {
      const updatedValue = {
        ...current,
        ...update,
      };
      if (update.phase === "zooming_in") {
        updatedValue.startTime = Date.now();
      }
      set(cameraAnimStateAtom, updatedValue);
    }
  },
);

export const clearCameraAnimationAtom = atom(null, (_, set) => {
  set(cameraAnimStateAtom, null);
  set(cameraAnimPositionsAtom, null);
});

export const locationAtom = atom<PlayerLocation>({
  area: Area.VILLAGE,
  interior: null,
});
export const worldMetadataAtom = atom<WorldMetadata | null>(null);
export const isMovingFamily = atomFamily((id: string) => atom<boolean>(false));

export const activeScenarioIdAtom = atom<ScenarioId | null>(null);
export const scenarioAtom = atom<Scenario | null>(null);
export const updateScenarioAtom = atom(
  null,
  (get, set, update: { nextStep?: number; isTypingComplete?: boolean }) => {
    const { nextStep, isTypingComplete } = update;
    const current = get(scenarioAtom);

    if (current) {
      const stateObject = current.state;
      if (nextStep && nextStep >= 0) {
        stateObject.currentStep = nextStep;
      }
      if (isTypingComplete !== undefined) {
        stateObject.isTypingComplete = isTypingComplete;
      }

      set(scenarioAtom, { ...current, state: stateObject });
    }
  },
);

export const devModeAtom = atom(false);
export const composerAtom = atom<EffectComposer | null>(null);
export const selfieUrlAtom = atom<string | null>(null);

export const friendsAtom = atom<Friend[]>([]);
