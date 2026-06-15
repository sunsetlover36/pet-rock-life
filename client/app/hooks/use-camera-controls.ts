import { useRef, type RefObject } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { miniapp } from "~/services/miniapp";
import * as THREE from "three";
import {
  activeInteractionFamily,
  useGameStore,
  currentPlayerAtom,
  cameraAnimPositionsAtom,
  cameraAnimStateAtom,
  startCameraAnimationAtom,
  clearCameraAnimationAtom,
  clientStore,
  cameraStateAtom,
  locationAtom,
  updateCameraAnimationPhaseAtom,
  activeScenarioIdAtom,
} from "~/store";
import { useAtomValue } from "jotai";
import {
  CAMERA_OFFSET,
  CAMERA_SENSITIVITY,
  CAMERA_TRANSITION_SPEED,
  easeInOutCubic,
  getMovementDirection,
  lerpAngle,
  normalizeAngle,
} from "~/config/camera";
import { useKeyboardControls } from "@react-three/drei";
import { getMovementLock } from "~/config/movement";
import type { RapierRigidBody } from "@react-three/rapier";

interface CameraControlsParams {
  playerRef: RefObject<RapierRigidBody | null>;
  controlPlane?: THREE.Mesh | null;
  onZoomIn?: (params: { duration?: number }) => void;
  onZoomInComplete?: () => void;
  onHold?: (params: { duration?: number }) => void;
  onHoldComplete?: () => void;
  onZoomOut?: (params: { duration?: number }) => void;
  onZoomOutComplete?: () => void;
}
export const useCameraControls = (params?: CameraControlsParams) => {
  const {
    playerRef,
    controlPlane,
    onZoomIn,
    onZoomInComplete,
    onHold,
    onHoldComplete,
    onZoomOut,
    onZoomOutComplete,
  } = params ?? {};

  const camera = useThree((state) => state.camera);
  const [, get] = useKeyboardControls();
  const currentPlayer = useAtomValue(currentPlayerAtom);

  const isStartingAnim = useRef(false);
  const isDraggingCamera = useRef(false);
  const lastTouchPosition = useRef({ x: 0, y: 0 });

  const cameraMode = useRef<"auto" | "manual">("auto");
  const currentCameraAngle = useRef(0);
  const automaticCameraAngle = useRef(0);
  const manualCameraAngle = useRef(0);

  // Timeouts
  const zoomInToHoldTimeout = useRef<NodeJS.Timeout>(null);
  const holdToZoomOutTimeout = useRef<NodeJS.Timeout>(null);

  // Helper functions
  const getCurrentLookAtTarget = (): THREE.Vector3 => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    return camera.position.clone().add(direction.multiplyScalar(10));
  };

  const zoomIn = ({
    sourcePosition,
    targetPosition,
    lookAt,
    duration = 3000,
    lerpLookAt = true,
  }: {
    sourcePosition?: THREE.Vector3;
    targetPosition?: THREE.Vector3;
    lookAt: THREE.Vector3;
    duration?: number;
    lerpLookAt?: boolean;
  }) => {
    onZoomIn?.({ duration });

    const currentLookAtTarget = getCurrentLookAtTarget();
    clientStore.set(startCameraAnimationAtom, {
      startPosition: sourcePosition ?? camera.position,
      startTarget: {
        x: currentLookAtTarget.x,
        y: currentLookAtTarget.y,
        z: currentLookAtTarget.z,
      },
      endPosition: targetPosition ?? camera.position,
      endTarget: lookAt,
      duration,
      phase: "zooming_in",
      lerpLookAt,
    });

    return { duration };
  };
  const hold = (params?: { duration?: number }) => {
    const { duration = 3000 } = params ?? {};

    onZoomInComplete?.();
    onHold?.({ duration });
    if (zoomInToHoldTimeout.current !== null) {
      clearTimeout(zoomInToHoldTimeout.current);
      zoomInToHoldTimeout.current = null;
    }

    clientStore.set(updateCameraAnimationPhaseAtom, {
      phase: "holding",
      duration,
      startTime: Date.now(),
    });

    return { duration };
  };
  const zoomOut = async (params?: {
    duration?: number;
    lerpLookAt?: boolean;
  }) => {
    const { duration = 1500, lerpLookAt = true } = params ?? {};
    const cameraState = clientStore.get(cameraStateAtom);
    if (!cameraState || !camera) return;

    onHoldComplete?.();
    onZoomOut?.({ duration });
    if (holdToZoomOutTimeout.current !== null) {
      clearTimeout(holdToZoomOutTimeout.current);
      holdToZoomOutTimeout.current = null;
    }

    const currentLookAtTarget = getCurrentLookAtTarget();
    clientStore.set(startCameraAnimationAtom, {
      startPosition: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
      startTarget: {
        x: currentLookAtTarget.x,
        y: currentLookAtTarget.y,
        z: currentLookAtTarget.z,
      },
      endPosition: {
        x: cameraState.position.x,
        y: cameraState.position.y,
        z: cameraState.position.z,
      },
      endTarget: {
        x: cameraState.lookAt.x,
        y: cameraState.lookAt.y,
        z: cameraState.lookAt.z,
      },
      duration,
      phase: "zooming_out",
      lerpLookAt,
    });

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
        onZoomOutComplete?.();
        clientStore.set(clearCameraAnimationAtom);
      }, duration),
    );

    return { duration };
  };
  const startAnimation = (params: {
    sourcePosition: THREE.Vector3;
    targetPosition: THREE.Vector3;
    lookAt: THREE.Vector3;
    durations?: {
      zoomIn?: number;
      hold?: number;
      zoomOut?: number;
    };
  }) => {
    const {
      sourcePosition,
      targetPosition,
      lookAt,
      durations: _durations,
    } = params;
    let durations = _durations || { zoomIn: 3000, hold: 3000, zoomOut: 1500 };
    if (!durations.zoomIn) {
      durations.zoomIn = 3000;
    }
    if (!durations.hold) {
      durations.hold = 3000;
    }
    if (!durations.zoomOut) {
      durations.zoomOut = 1500;
    }

    zoomIn({
      sourcePosition,
      targetPosition,
      lookAt,
      duration: durations.zoomIn,
    });

    zoomInToHoldTimeout.current = setTimeout(() => {
      hold({ duration: durations.hold });
    }, durations.zoomIn);
    holdToZoomOutTimeout.current = setTimeout(() => {
      zoomOut({ duration: durations.zoomOut });
    }, durations.zoomIn + durations.hold);
  };

  const animateCameraFrame = () => {
    const animState = clientStore.get(cameraAnimStateAtom);
    const animPositions = clientStore.get(cameraAnimPositionsAtom);

    if (!animState || !animPositions || animState.phase === "holding") return;

    const { startTime, duration, lerpLookAt } = animState;
    const { startPosition, startTarget, endPosition, endTarget } =
      animPositions;

    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    const startPosVec = new THREE.Vector3(
      startPosition.x,
      startPosition.y,
      startPosition.z,
    );
    const endPosVec = new THREE.Vector3(
      endPosition.x,
      endPosition.y,
      endPosition.z,
    );
    const startTargetVec = new THREE.Vector3(
      startTarget.x,
      startTarget.y,
      startTarget.z,
    );
    const endTargetVec = new THREE.Vector3(
      endTarget.x,
      endTarget.y,
      endTarget.z,
    );

    camera.position.lerpVectors(startPosVec, endPosVec, eased);
    const currentTarget = startTargetVec.clone().lerp(endTargetVec, eased);
    camera.lookAt(lerpLookAt ? currentTarget : endTargetVec);
  };

  const onControlPlaneFocus = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    const activeInteraction = clientStore.get(
      activeInteractionFamily(currentPlayer?.fid),
    );
    const activeScenarioId = clientStore.get(activeScenarioIdAtom);
    if (activeInteraction !== null || activeScenarioId !== null) return;

    miniapp.haptic("light");
    isDraggingCamera.current = true;
    lastTouchPosition.current = { x: e.clientX, y: e.clientY };
    cameraMode.current = "manual";

    // Sync manual angle with current camera position to prevent jumping
    manualCameraAngle.current = currentCameraAngle.current;
  };
  const onControlPlaneMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    if (!isDraggingCamera.current) return;

    const deltaX = e.clientX - lastTouchPosition.current.x;
    manualCameraAngle.current += deltaX * CAMERA_SENSITIVITY;
    lastTouchPosition.current = { x: e.clientX, y: e.clientY };
  };
  const onControlPlaneBlur = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    miniapp.haptic("light");
    isDraggingCamera.current = false;

    setTimeout(() => {
      if (cameraMode.current === "manual" && !isDraggingCamera.current) {
        // Sync automatic angle with current position before switching to prevent jumping
        automaticCameraAngle.current = currentCameraAngle.current;
        cameraMode.current = "auto";
      }
    }, CAMERA_TRANSITION_SPEED * 1000);
  };

  // Update plane position and handle camera animations
  useFrame((state) => {
    // Get current state from atoms using clientStore.get (no reactive overhead)
    const cameraAnimState = clientStore.get(cameraAnimStateAtom);

    // Handle camera animations
    if (cameraAnimState) {
      isStartingAnim.current = false;
      animateCameraFrame();
    }

    if (!currentPlayer || !playerRef?.current) {
      return;
    }

    const gameStore = useGameStore.getState();
    const currentState = gameStore.getPlayerState(currentPlayer.id);
    if (!currentState) return;

    const playerPosition = playerRef.current.translation();
    const { joystick } = currentState;
    const { forward, backward, left, right, jump } = get();

    let moveX = 0;
    let moveZ = 0;

    const movementLock = getMovementLock({
      keyboardControls: { forward, backward, left, right, jump },
    });
    if (!movementLock.isLocked) {
      moveX = joystick.x ?? 0;
      moveZ = joystick.y ? -joystick.y : 0;

      if (forward) moveZ -= 1;
      if (backward) moveZ += 1;
      if (left) moveX -= 1;
      if (right) moveX += 1;
    }

    const direction = new THREE.Vector3();
    const movementDirection = getMovementDirection(
      new THREE.Vector3(moveX, 0, moveZ),
      state.camera,
    );
    direction.copy(movementDirection.direction);

    if (direction.lengthSq() > 0) {
      const targetAngle = Math.atan2(direction.x, direction.z);
      const isMovingBackward = joystick.direction === "BACKWARD" || backward;

      if (!isMovingBackward) {
        const targetCameraAngle = targetAngle + Math.PI;
        const angleDiff = Math.abs(
          normalizeAngle(targetCameraAngle - automaticCameraAngle.current),
        );

        if (angleDiff > 0.01) {
          automaticCameraAngle.current = lerpAngle(
            automaticCameraAngle.current,
            targetCameraAngle,
            0.025,
          );
        }
      }
    }

    currentCameraAngle.current = lerpAngle(
      currentCameraAngle.current,
      cameraMode.current === "auto"
        ? automaticCameraAngle.current
        : manualCameraAngle.current,
      0.1,
    );

    const { interior } = clientStore.get(locationAtom);
    const cameraOffset = interior ? CAMERA_OFFSET.interior : CAMERA_OFFSET.area;
    const cameraPosition = new THREE.Vector3(
      playerPosition.x +
        Math.sin(currentCameraAngle.current) * cameraOffset.distance,
      playerPosition.y + cameraOffset.height,
      playerPosition.z +
        Math.cos(currentCameraAngle.current) * cameraOffset.distance,
    );

    const lookAt = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y + 1,
      playerPosition.z,
    );

    clientStore.set(cameraStateAtom, {
      position: cameraPosition,
      lookAt,
      angle: currentCameraAngle.current,
    });

    // Update camera position only if no interaction animation is active
    if (!cameraAnimState) {
      state.camera.position.copy(cameraPosition);
      state.camera.lookAt(lookAt);
    }

    // Update plane position when not animating
    if (controlPlane && !cameraAnimState) {
      // Position the plane far in front of the camera
      const cameraDirection = new THREE.Vector3();
      state.camera.getWorldDirection(cameraDirection);

      // Place the plane 50 units in front of the camera
      const planePosition = state.camera.position
        .clone()
        .add(cameraDirection.multiplyScalar(50));
      controlPlane.position.copy(planePosition);
      controlPlane.lookAt(state.camera.position);
    }
  }, -10);

  return {
    cameraControls: { zoomIn, hold, zoomOut, startAnimation },
    controlPlane: {
      onControlPlaneFocus,
      onControlPlaneMove,
      onControlPlaneBlur,
    },
  };
};
