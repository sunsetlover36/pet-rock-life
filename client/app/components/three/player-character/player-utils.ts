import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { getMovementLock } from "~/config/movement";
import type { KeyboardControls, Position } from "~/types";

const tempEuler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const tempQuaternion2 = new THREE.Quaternion();

interface GetMovementRotationParams {
  direction: THREE.Vector3;
  angle: number;
  rigidbody: RapierRigidBody;
  keyboardControls: KeyboardControls;
}
export const getMovementRotation = ({
  direction,
  angle,
  rigidbody,
  keyboardControls,
}: GetMovementRotationParams) => {
  const rotation = rigidbody.rotation() as THREE.Quaternion;
  const movementLock = getMovementLock({ keyboardControls });

  let targetQuat = tempQuaternion;
  let slerpedQuat = tempQuaternion2;
  if (direction.lengthSq() > 0 && !movementLock.isLocked) {
    tempEuler.set(0, angle, 0);
    targetQuat = tempQuaternion.setFromEuler(tempEuler);
    slerpedQuat = tempQuaternion2
      .copy(rotation)
      .slerp(targetQuat, 0.1)
      .normalize();
  }

  return {
    targetQuat,
    slerpedQuat,
  };
};

interface GetLookAtParams {
  rigidbody: RapierRigidBody;
  targetPosition: THREE.Vector3;
  offset: THREE.Vector3;
}

const lookAtQuat = new THREE.Quaternion();
export const getLookAt = ({
  rigidbody,
  targetPosition,
  offset,
}: GetLookAtParams) => {
  const sourcePosition = rigidbody.translation();
  const sourceRotation = rigidbody.rotation();

  let targetAngle;
  const deltaX = targetPosition.x - sourcePosition.x;
  const deltaZ = targetPosition.z - sourcePosition.z;

  targetAngle = Math.atan2(deltaX, deltaZ);
  tempEuler.set(0, targetAngle, 0);
  const baseQuat = new THREE.Quaternion().setFromEuler(tempEuler);

  tempEuler.set(offset.x, offset.y, offset.z);
  const tiltQuat = new THREE.Quaternion().setFromEuler(tempEuler);

  // Combine: first face target, then tilt
  const finalQuat = baseQuat.multiply(tiltQuat);
  const slerpedQuat = lookAtQuat
    .copy(sourceRotation)
    .slerp(finalQuat, 0.1)
    .normalize();

  return { slerpedQuat };
};

interface BackflipState {
  isFlipping: boolean;
  startTime: number;
  duration: number;
  delay?: number;
}
interface GetBackflipRotationParams {
  state: BackflipState;
  elapsedTime: number;
  initialRotation: THREE.Quaternion;
}
export const getBackflipRotation = ({
  state,
  elapsedTime,
  initialRotation,
}: GetBackflipRotationParams) => {
  const { startTime, delay = 0, duration } = state;

  const elapsed = elapsedTime * 1000 - startTime;
  const animationElapsed = Math.max(elapsed - delay, 0);
  let progress = 0;
  let finalQuat = new THREE.Quaternion();
  finalQuat.copy(initialRotation);

  if (elapsed >= delay) {
    progress = Math.min(animationElapsed / duration, 1);

    // Smooth easing function (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Full 360° rotation (2π radians) over time
    const xRotation = -easedProgress * Math.PI * 2;
    const xEuler = new THREE.Euler(xRotation, 0, 0);
    const xQuat = new THREE.Quaternion().setFromEuler(xEuler);

    finalQuat.copy(initialRotation).multiply(xQuat);
  }

  return {
    finalQuat,
    progress,
  };
};

interface RitualState {
  isRitualing: boolean;
  startTime: number;
  duration: number;
  originalRockPosition: Position;
}
interface GetRitualDataParams {
  state: RitualState;
  elapsedTime: number;
  rigidbody: RapierRigidBody;
}

const RITUAL_IMPULSE_MULTIPLIER = 5;
export const getRitualData = ({
  state,
  elapsedTime,
  rigidbody,
}: GetRitualDataParams) => {
  const { startTime, duration, originalRockPosition } = state;

  const animationElapsed = elapsedTime * 1000 - startTime;
  const progress = Math.min(animationElapsed / duration, 1);
  const easedProgress = Math.sin(progress * Math.PI);

  const levitateHeight = easedProgress * 2;
  const floatOffset = Math.sin(elapsedTime * 3) * 0.2;

  const targetY = originalRockPosition.y + levitateHeight + floatOffset;

  const currentRockPos = rigidbody.translation();
  const deltaY = (targetY - currentRockPos.y) * RITUAL_IMPULSE_MULTIPLIER;

  return {
    deltaY,
    progress,
  };
};
