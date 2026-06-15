import {
  activeInteractionFamily,
  activeScenarioIdAtom,
  clientStore,
  currentPlayerAtom,
  isChatOpenAtom,
  uiModeAtom,
} from "~/store";
import { UIMode, type KeyboardControls } from "~/types";

// Player speed
export const SPEED = 6.5;

// How strong joystick impacts animation speed
export const SPEED_JOYSTICK_DISTANCE_IMPACT = 80;

// Player jump height
export const JUMP_HEIGHT = 5;

interface MovementLock {
  isLocked: boolean;
  lockReason:
    | "chat"
    | "scenario"
    | "interaction"
    | "cinematic-ui"
    | "paused"
    | null;
}

// Non-reactive
export const getMovementLock = ({
  keyboardControls,
}: {
  keyboardControls: KeyboardControls;
}) => {
  const isChatOpen = clientStore.get(isChatOpenAtom);
  const activeScenarioId = clientStore.get(activeScenarioIdAtom);
  const currentPlayer = clientStore.get(currentPlayerAtom);
  const activeInteraction = clientStore.get(
    activeInteractionFamily(currentPlayer?.fid),
  );
  const uiMode = clientStore.get(uiModeAtom);

  let state: MovementLock = {
    isLocked: false,
    lockReason: null,
  };

  const { forward, backward, left, right, jump } = keyboardControls;
  const chatBlocker =
    isChatOpen && (forward || backward || left || right || jump);
  if (
    chatBlocker ||
    activeScenarioId !== null ||
    activeInteraction ||
    uiMode === UIMode.CINEMATIC ||
    uiMode === UIMode.PAUSED
  ) {
    state.isLocked = true;
  }

  if (isChatOpen) {
    state.lockReason = "chat";
  } else if (activeScenarioId !== null) {
    state.lockReason = "scenario";
  } else if (activeInteraction) {
    state.lockReason = "interaction";
  } else if (uiMode === UIMode.CINEMATIC) {
    state.lockReason = "cinematic-ui";
  } else if (uiMode === UIMode.PAUSED) {
    state.lockReason = "paused";
  }

  return state;
};

export const getMovementSpeed = (distance: number | null) => {
  let walkingSpeed = SPEED;
  if (distance && distance > 0) {
    walkingSpeed = (SPEED * distance) / SPEED_JOYSTICK_DISTANCE_IMPACT;
  }

  let animationSpeed = 1;
  if (distance && distance > 0) {
    animationSpeed = distance / SPEED_JOYSTICK_DISTANCE_IMPACT;
  }

  return {
    walkingSpeed,
    animationSpeed,
  };
};
