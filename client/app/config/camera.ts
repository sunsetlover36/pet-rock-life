import * as THREE from "three";
import { InteractionType } from "~/types";

// Interaction types that focus on target player only
export const SINGLE_FOCUS_INTERACTIONS = [
  InteractionType.WAVE,
  InteractionType.ADMIRE_ROCK,
];

// Interaction types that frame both players
export const DUAL_FOCUS_INTERACTIONS = [
  InteractionType.HUG,
  InteractionType.KISS,
  InteractionType.MARRY,
];

export const CAMERA_SENSITIVITY = 0.005;
export const CAMERA_TRANSITION_SPEED = 3; // seconds to return to auto mode
export const CAMERA_OFFSET = {
  area: {
    distance: 10,
    height: 4,
  },
  interior: {
    distance: 6,
    height: 3,
  },
};

export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};

export const areQuaternionsEqual = (
  q1: THREE.Quaternion,
  q2: THREE.Quaternion,
  toleranceRadians = 0.01,
) => {
  const angleDiff = q1.angleTo(q2);
  return angleDiff < toleranceRadians;
};

export const normalizeAngle = (angle: number) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

export const lerpAngle = (from: number, to: number, factor: number) => {
  const delta = normalizeAngle(to - from);
  return from + delta * factor;
};

export const getMovementDirection = (
  inputDirection: THREE.Vector3,
  camera: THREE.Camera,
) => {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  const cameraRight = new THREE.Vector3();
  cameraRight.crossVectors(cameraDirection, camera.up).normalize();

  // Get camera's forward vector (projected on ground plane)
  const cameraForward = new THREE.Vector3();
  cameraForward.crossVectors(camera.up, cameraRight).normalize();

  // Calculate world movement direction based on camera orientation
  const worldDirection = new THREE.Vector3();
  worldDirection.addScaledVector(cameraRight, inputDirection.x);
  worldDirection.addScaledVector(cameraForward, -inputDirection.z); // Negative because forward is -z

  const direction = new THREE.Vector3();
  direction.copy(worldDirection).normalize();

  return {
    direction,
    angle: Math.atan2(direction.x, direction.z),
  };
};

export const calculateSingleFocusCamera = ({
  targetPosition,
  interactionType,
}: {
  targetPosition: THREE.Vector3;
  interactionType: InteractionType;
}) => {
  let offset: THREE.Vector3;

  switch (interactionType) {
    case InteractionType.ADMIRE_ROCK:
      offset = new THREE.Vector3(2, 4, 6); // Side angle
      break;
    default:
      offset = new THREE.Vector3(0, 2, 6); // Standard angle
  }

  return {
    position: targetPosition.clone().add(offset),
    target: targetPosition.clone().add(new THREE.Vector3(0, 2, 0)),
  };
};

export const calculateDualFocusCamera = ({
  sourcePosition,
  targetPosition,
  interactionType,
}: {
  sourcePosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  interactionType: InteractionType;
}) => {
  const midpoint = sourcePosition
    .clone()
    .add(targetPosition)
    .multiplyScalar(0.5);
  const distance = sourcePosition.distanceTo(targetPosition);

  let cameraDistance: number;
  let height: number;
  let xOffset: number = 0;

  switch (interactionType) {
    case InteractionType.MARRY:
      cameraDistance = Math.max(15, distance * 1.5);
      height = 10; // Elevated for ceremony
      break;
    case InteractionType.KISS:
      xOffset = 6;
      cameraDistance = Math.max(8, distance * 1.2);
      height = 4; // Closer and lower for intimacy
      break;
    case InteractionType.HUG:
      cameraDistance = Math.max(8, distance * 1.2);
      height = 4;
      break;
    case InteractionType.BACKFLIP:
    case InteractionType.RITUAL:
      cameraDistance = Math.max(12, distance * 1.4);
      height = 6;
      break;
    default:
      cameraDistance = Math.max(12, distance * 1.2);
      height = 4;
  }

  return {
    position: midpoint
      .clone()
      .add(new THREE.Vector3(xOffset, height, cameraDistance)),
    target: midpoint.clone().add(new THREE.Vector3(0, 1, 0)),
  };
};
