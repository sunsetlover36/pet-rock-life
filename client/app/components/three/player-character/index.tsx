import { useKeyboardControls } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useRef, type FC, type RefObject } from "react";
import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { PetRock } from "./pet-rock";
import {
  RapierRigidBody,
  RigidBody,
  useRapier,
  CuboidCollider,
  useRopeJoint,
  RapierCollider,
} from "@react-three/rapier";
import { Rope } from "./rope";
import {
  jumpTriggerAtom,
  clientStore,
  currentPlayerAtom,
  playerProfileSheetAtom,
  selectedPlayerProfileAtom,
  activeInteractionFamily,
  cameraAnimStateAtom,
  locationAtom,
  wsManagerAtom,
  isMovingFamily,
} from "~/store";
import { soundManager } from "~/services/sound-manager";
import { ageManager } from "~/services/age-manager";
import { SKIN_CONFIGS } from "~/config/skins";
import {
  InteractionType,
  type PerformedInteraction,
  type PlayerProfile,
  PlayerSkin,
  RigidBodyType,
  Sound,
} from "~/types";
import { useGameStore } from "~/store";
import { HatModel } from "~/components/three/models";
import { HAT_CONFIGS } from "~/config/hats";
import { getInteractionDuration, getSkinComponent } from "~/config/utils";
import { RockMessages } from "./rock-messages";
import { miniapp } from "~/services/miniapp";
import { TeleportationManager } from "~/services/teleportation-manager";
import {
  areQuaternionsEqual,
  calculateDualFocusCamera,
  calculateSingleFocusCamera,
  DUAL_FOCUS_INTERACTIONS,
  getMovementDirection,
  SINGLE_FOCUS_INTERACTIONS,
} from "~/config/camera";
import {
  getMovementLock,
  getMovementSpeed,
  JUMP_HEIGHT,
} from "~/config/movement";
import {
  getBackflipRotation,
  getLookAt,
  getMovementRotation,
  getRitualData,
} from "./player-utils";
import { useCameraControls } from "~/hooks/use-camera-controls";
import { CameraControlPlane } from "./camera-control-plane";
import { Hud } from "./hud";
import { useAtomValue } from "jotai";

const usePlayer = ({ player }: { player: PlayerProfile }) => {
  const { id } = player;

  // ----
  // -- Player state
  const initialState = useGameStore.getState().getPlayerState(id);
  const initialPosition: [number, number, number] = initialState
    ? [
        initialState.position.x,
        initialState.position.y,
        initialState.position.z,
      ]
    : [0, 100, 0];

  const ref = useRef<RapierRigidBody>(null);
  const hudRef = useRef<THREE.Group>(null);
  const rockRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);

  const currentRotation = useRef(new THREE.Quaternion());
  const preInteractionRotation = useRef<THREE.Quaternion | null>(null);

  // Rope positions - using refs to avoid state updates
  const ropeStartPos = useRef(new THREE.Vector3(0, 1, 0));
  const ropeEndPos = useRef(new THREE.Vector3(2, 1, 0));

  const movementSpeedRef = useRef(1);

  const lastPosition = useRef(new THREE.Vector3(...initialPosition));
  const lastRockPosition = useRef(new THREE.Vector3());
  const lastRockRotation = useRef(new THREE.Quaternion());

  const isJumpOnCooldownRef = useRef(false);

  const onPlayerClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    clientStore.set(selectedPlayerProfileAtom, player);
    clientStore.set(playerProfileSheetAtom, true);
  };

  // Update local age when server age changes
  useEffect(() => {
    const initialAge = player.petRock?.age ?? 0;
    ageManager.registerPlayer(player.id, initialAge);

    if (player.petRock?.age !== undefined) {
      ageManager.updatePlayerAge(player.id, player.petRock.age);
    }

    return () => {
      ageManager.unregisterPlayer(player.id);
    };
  }, [player.petRock?.age, player.id]);

  return {
    ref,
    hudRef,
    rockRef,
    colliderRef,
    initialPosition,
    currentRotation,
    rope: {
      startPosition: ropeStartPos.current,
      endPosition: ropeEndPos.current,
    },
    movementSpeedRef,
    lastPosition,
    lastRockPosition,
    lastRockRotation,
    preInteractionRotation,
    isJumpOnCooldownRef,
    onPlayerClick,
  };
};

interface CharacterProps {
  ref: RefObject<RapierRigidBody | null>;
  hudRef: RefObject<THREE.Group | null>;
  rockRef: RefObject<RapierRigidBody | null>;
  colliderRef: RefObject<RapierCollider | null>;
  position: [number, number, number];
  movementSpeed: number;
  isCurrentPlayer?: boolean;
  player: PlayerProfile;
  rope: {
    startPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
  };
  onPlayerClick?: (event: ThreeEvent<MouseEvent>) => void;
  onRockPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
  onRockPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onRockPointerUp?: (event: ThreeEvent<PointerEvent>) => void;
  onRockPointerLeave?: (event: ThreeEvent<PointerEvent>) => void;
}
export const Character: FC<CharacterProps> = (props) => {
  const {
    ref,
    hudRef,
    rockRef,
    colliderRef,
    position,
    movementSpeed,
    isCurrentPlayer,
    player,
    rope,
    onPlayerClick,
    onRockPointerDown,
    onRockPointerMove,
    onRockPointerUp,
    onRockPointerLeave,
  } = props;

  const { hat, fid, petRock, skin } = player;

  const skinSettings =
    SKIN_CONFIGS[player.skin ?? PlayerSkin.SEAL].gameSettings;

  const hatConfig = HAT_CONFIGS[hat];
  const hatModelPath = hatConfig?.modelPath;
  const hatConfigForSkin = Object.assign({}, hatConfig.skinPositions[skin]);

  const CharacterModel = getSkinComponent(skin);
  return (
    <>
      <RigidBody
        ref={ref}
        colliders={false}
        mass={70}
        enabledRotations={[false, true, false]}
        position={position}
        friction={0.8}
        restitution={0.1}
        linearDamping={0.5}
        angularDamping={0.9}
        type={isCurrentPlayer ? "dynamic" : "kinematicPosition"}
        userData={{ name: RigidBodyType.PLAYER }}
      >
        <CuboidCollider
          ref={colliderRef}
          args={[
            skinSettings.colliderParams[0],
            skinSettings.colliderParams[1] +
              (hat && hatModelPath ? skinSettings.hatColliderOffset : 0),
            skinSettings.colliderParams[2],
          ]}
          position={[
            0,
            hat && hatModelPath ? skinSettings.hatColliderOffset : 0,
            0,
          ]}
        />
        <group onPointerDown={onPlayerClick}>
          <CharacterModel
            position={[
              skinSettings.position.x,
              skinSettings.position.y,
              skinSettings.position.z,
            ]}
            hatModelPath={hatModelPath}
            hatConfig={hatConfigForSkin}
            playerId={player.id}
            movementSpeed={movementSpeed}
          />
        </group>
      </RigidBody>
      <group ref={hudRef}>
        <Hud profile={player} />
      </group>

      <PetRock
        position={[2, 3, 0]}
        rigidbodyRef={rockRef}
        isCurrentPlayer={isCurrentPlayer}
        rockName={petRock?.name}
        playerId={fid}
        onPointerDown={onRockPointerDown}
        onPointerMove={onRockPointerMove}
        onPointerUp={onRockPointerUp}
        onPointerLeave={onRockPointerLeave}
      >
        <RockMessages profile={player} />
      </PetRock>
      <Rope {...rope} />
    </>
  );
};

interface PlayerProps {
  player: PlayerProfile;
}
export const OtherPlayer: FC<PlayerProps> = ({ player }) => {
  const {
    ref,
    hudRef,
    rockRef,
    colliderRef,
    initialPosition,
    currentRotation,
    rope,
    lastPosition,
    lastRockPosition,
    movementSpeedRef,
    onPlayerClick,
  } = usePlayer({ player });

  useFrame(() => {
    const gameStore = useGameStore.getState();
    const currentState = gameStore.getPlayerState(player.id);
    if (!currentState || !ref.current || !hudRef.current || !rockRef.current)
      return;

    const { position, rotation, rockPosition, rockRotation, joystick } =
      currentState;
    ref.current.setNextKinematicTranslation(position);
    hudRef.current.position.set(position.x, position.y, position.z);

    const quaternion = new THREE.Quaternion();
    quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    currentRotation.current.slerp(quaternion, 0.5);
    ref.current.setNextKinematicRotation(currentRotation.current);

    rockRef.current.setNextKinematicTranslation(rockPosition);
    rockRef.current.setNextKinematicRotation(rockRotation);

    const skinSettings =
      SKIN_CONFIGS[player.skin ?? PlayerSkin.SEAL].gameSettings;
    const translationOffset = skinSettings.translationOffset;
    rope.startPosition.set(
      position.x + translationOffset.x,
      position.y + translationOffset.y,
      position.z,
    );
    rope.endPosition.set(rockPosition.x, rockPosition.y, rockPosition.z);

    lastPosition.current.set(position.x, position.y, position.z);
    lastRockPosition.current.set(
      rockPosition.x,
      rockPosition.y,
      rockPosition.z,
    );

    clientStore.set(isMovingFamily(player.id), joystick.type === "move");

    const movementSpeed = getMovementSpeed(joystick.distance);
    movementSpeedRef.current = movementSpeed.animationSpeed;

    if (colliderRef.current) {
      const activeInteractionAtom = activeInteractionFamily(player.fid);
      const activeInteraction = clientStore.get(activeInteractionAtom);
      if (!activeInteraction) {
        const { interior } = clientStore.get(locationAtom);
        if (interior !== null && colliderRef.current.isEnabled()) {
          colliderRef.current.setEnabled(false);
        } else if (interior === null && !colliderRef.current.isEnabled()) {
          colliderRef.current.setEnabled(true);
        }
      }
    }
  });

  return (
    <Character
      ref={ref}
      hudRef={hudRef}
      rockRef={rockRef}
      colliderRef={colliderRef}
      position={initialPosition}
      movementSpeed={movementSpeedRef.current}
      player={player}
      rope={rope}
      onPlayerClick={onPlayerClick}
    />
  );
};
export const CurrentPlayer: FC<PlayerProps> = ({ player }) => {
  const wsManager = useAtomValue(wsManagerAtom);

  const {
    ref,
    hudRef,
    rockRef,
    colliderRef,
    initialPosition,
    currentRotation,
    rope,
    lastPosition,
    lastRockPosition,
    lastRockRotation,
    movementSpeedRef,
    preInteractionRotation,
    isJumpOnCooldownRef,
    onPlayerClick,
  } = usePlayer({ player });
  const { startPosition: ropeStartPos, endPosition: ropeEndPos } = rope;

  // -- Interactions
  const lastInteractionId = useRef<string | null>(null);

  // -- Rock rubbing logic
  const rubbingStateRef = useRef({
    isRubbing: false,
    pointerId: -1,
    lastPosition: { x: 0, y: 0 },
    intensity: 0,
    startTime: 0,
    lastSocketSend: 0,
    socketThrottle: 16,
  });

  const handleRubStart = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      rubbingStateRef.current.pointerId = e.pointerId;

      const state = rubbingStateRef.current;
      state.isRubbing = true;
      state.startTime = performance.now();
      state.lastPosition = { x: e.point.x, y: e.point.y };
      state.intensity = 0;
      miniapp.haptic("heavy");
      soundManager.playSound(Sound.SQUEAK, 0.1);

      const currentPlayer = clientStore.get(currentPlayerAtom);
      if (currentPlayer && player) {
        wsManager?.petRock({
          from: currentPlayer.fid,
          to: player.fid,
          duration: 0,
          timestamp: Date.now(),
          rubState: "start",
        });
      }
    },
    [player],
  );
  const handleRubMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    const state = rubbingStateRef.current;

    if (!state.isRubbing || e.pointerId !== state.pointerId) return;

    // Calculate movement intensity
    const deltaX = e.point.x - state.lastPosition.x;
    const deltaY = e.point.y - state.lastPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Update intensity (you can use different calculations here)
    state.intensity = Math.min(distance * 10, 1); // normalize to 0-1
    state.lastPosition = { x: e.point.x, y: e.point.y };

    const now = performance.now();
    if (now - state.lastSocketSend >= state.socketThrottle) {
      // wsManager?.sendMessage('rub_move', {
      //   position: { x: e.point.x, y: e.point.y },
      //   intensity: state.intensity,
      //   delta: distance,
      //   timestamp: now
      // });
      state.lastSocketSend = now;
    }
  }, []);
  const handleRubEnd = useCallback((e: ThreeEvent<PointerEvent>) => {
    const state = rubbingStateRef.current;

    if (!state.isRubbing || e.pointerId !== state.pointerId) return;

    const duration = performance.now() - state.startTime;
    miniapp.haptic("heavy");

    const currentPlayer = clientStore.get(currentPlayerAtom);
    if (currentPlayer && player) {
      wsManager?.petRock({
        from: currentPlayer.fid,
        to: player.fid,
        duration,
        timestamp: Date.now(),
        rubState: "end",
      });
    }

    // Reset state
    state.isRubbing = false;
    state.pointerId = -1;
    state.intensity = 0;
  }, []);
  // -- End of rock rubbing logic

  // -- Active interaction logic
  const handleActiveInteraction = ({
    activeInteraction,
    elapsedTime,
    camera,
  }: {
    activeInteraction: PerformedInteraction | null;
    elapsedTime: number;
    camera: THREE.Camera;
  }) => {
    if (!ref.current || !rockRef.current || !colliderRef.current) return;

    const gameStore = useGameStore.getState();

    const rotation = ref.current.rotation();
    const currentQuat = new THREE.Quaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w,
    );
    const rockTranslation = rockRef.current.translation();

    if (!activeInteraction) {
      if (preInteractionRotation.current) {
        if (!areQuaternionsEqual(currentQuat, preInteractionRotation.current)) {
          const prevRotation =
            preInteractionRotation.current ?? new THREE.Quaternion();

          const slerpedQuat = new THREE.Quaternion()
            .copy(currentQuat)
            .slerp(prevRotation, 0.05)
            .normalize();

          ref.current.setRotation(slerpedQuat, true);
          currentRotation.current = slerpedQuat;

          return { slerpedQuat };
        }

        if (!colliderRef.current.isEnabled()) {
          colliderRef.current.setEnabled(true);
        }
        preInteractionRotation.current = null;
      }

      return;
    }

    if (preInteractionRotation.current === null) {
      preInteractionRotation.current = currentQuat;
    }

    if (lastInteractionId.current === null) {
      handleNewInteraction(activeInteraction, camera);
      return;
    }

    const cameraAnimState = clientStore.get(cameraAnimStateAtom);
    if (
      !cameraAnimState ||
      ["zooming_in", "zooming_out"].includes(cameraAnimState.phase)
    ) {
      return;
    }

    if (
      activeInteraction.type === InteractionType.HUG ||
      activeInteraction.type === InteractionType.KISS
    ) {
      const targetPlayerState = gameStore.getPlayerState(
        activeInteraction.targetFid === player.fid
          ? activeInteraction.sourceFid.toString()
          : activeInteraction.targetFid.toString(),
      );

      if (targetPlayerState) {
        const targetPosition: [number, number, number] = [
          targetPlayerState.position.x,
          targetPlayerState.position.y,
          targetPlayerState.position.z,
        ];
        const { slerpedQuat } = getLookAt({
          rigidbody: ref.current,
          targetPosition: new THREE.Vector3(...targetPosition),
          offset: new THREE.Vector3(
            activeInteraction.type === InteractionType.HUG ? -0.5 : 0, // X offset for hug
            0,
            0,
          ),
        });

        colliderRef.current.setEnabled(false);
        ref.current.setRotation(slerpedQuat, true);
        currentRotation.current = slerpedQuat;
      }
    } else if (activeInteraction.type === InteractionType.BACKFLIP) {
      if (!backflipState.current.isFlipping) {
        backflipState.current = {
          isFlipping: true,
          startTime: elapsedTime * 1000,
          duration: getInteractionDuration(InteractionType.BACKFLIP),
          delay: 500,
        };
      }

      const { finalQuat, progress } = getBackflipRotation({
        state: backflipState.current,
        elapsedTime,
        initialRotation: preInteractionRotation.current,
      });

      ref.current.setRotation(finalQuat, true);
      currentRotation.current = finalQuat;

      // Add upward impulse at start of animation
      if (progress > 0 && progress < 0.1) {
        const currentVel = ref.current.linvel();
        ref.current.setLinvel(
          {
            x: currentVel.x,
            y: Math.max(currentVel.y, 8),
            z: currentVel.z,
          },
          true,
        );
      }

      // Check if animation (not total time) is complete
      if (progress >= 0.99 && backflipState.current.isFlipping) {
        backflipState.current.isFlipping = false;
      }
    } else if (activeInteraction.type === InteractionType.RITUAL) {
      if (!ritualState.current.isRitualing) {
        ritualState.current = {
          isRitualing: true,
          startTime: elapsedTime * 1000,
          duration: getInteractionDuration(InteractionType.RITUAL),
          originalRockPosition: { ...rockTranslation },
        };
      }
      const { deltaY, progress } = getRitualData({
        state: ritualState.current,
        elapsedTime,
        rigidbody: rockRef.current,
      });

      // Apply velocity to reach target height
      rockRef.current.setLinvel(
        {
          x: 0,
          y: deltaY,
          z: 0,
        },
        true,
      );

      if (progress > 0.01 && rockRef.current.gravityScale() === 1) {
        rockRef.current.setGravityScale(0, true);
      }
      if (progress >= 0.99 && ritualState.current.isRitualing) {
        ritualState.current.isRitualing = false;
        rockRef.current.setGravityScale(1, true);
      }
    }
  };
  // --

  // Timeouts & intervals
  const footstepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Misc
  const isFirstGrounded = useRef(true);

  const isPlayingFootstepsRef = useRef(false);
  const backflipState = useRef({
    isFlipping: false,
    startTime: 0,
    duration: getInteractionDuration(InteractionType.BACKFLIP),
    delay: 500,
  });
  const ritualState = useRef({
    isRitualing: false,
    startTime: 0,
    duration: getInteractionDuration(InteractionType.RITUAL),
    originalRockPosition: { x: 0, y: 0, z: 0 },
  });

  // -- Rest
  const [, get] = useKeyboardControls();
  const rapier = useRapier();
  // ----

  const playerSkinSettings =
    SKIN_CONFIGS[player.skin ?? PlayerSkin.SEAL].gameSettings;

  useRopeJoint(
    ref as RefObject<RapierRigidBody>,
    rockRef as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], playerSkinSettings.ropeJoint ?? 3.25],
  );

  const controlPlaneRef = useRef<THREE.Mesh>(null);
  const { cameraControls, controlPlane } = useCameraControls({
    playerRef: ref,
    controlPlane: controlPlaneRef.current,
    onZoomOutComplete: () => {
      lastInteractionId.current = null;

      const activeInteraction = clientStore.get(
        activeInteractionFamily(player.fid),
      );
      if (!activeInteraction) {
        return;
      }

      const sourceInteractionAtom = activeInteractionFamily(
        activeInteraction.sourceFid,
      );
      const targetInteractionAtom = activeInteractionFamily(
        activeInteraction.targetFid,
      );
      clientStore.set(sourceInteractionAtom, null);
      clientStore.set(targetInteractionAtom, null);
    },
  });

  useEffect(() => {
    return () => {
      // Cleanup footstep interval
      if (footstepIntervalRef.current) {
        clearInterval(footstepIntervalRef.current);
      }
    };
  }, [player.id]);

  // Register refs with teleportation context for current player
  useEffect(() => {
    if (player) {
      const wsManager = clientStore.get(wsManagerAtom);
      TeleportationManager.setRefs(ref, rockRef, player.id, wsManager);
    }
  }, [player]);

  useFrame((state) => {
    if (
      !ref.current ||
      !hudRef.current ||
      !rockRef.current ||
      !colliderRef.current
    )
      return;

    const gameStore = useGameStore.getState();
    const currentState = gameStore.getPlayerState(player.id);
    if (!currentState) return;

    const { joystick } = currentState;

    const velocity = ref.current.linvel();
    const mass = ref.current.mass();
    const translation = ref.current.translation();
    hudRef.current.position.set(translation.x, translation.y, translation.z);

    const rotation = ref.current.rotation() as THREE.Quaternion;

    const rockTranslation = rockRef.current.translation();
    const rockRotation = rockRef.current.rotation();
    const rockQuat = new THREE.Quaternion(
      rockRotation.x,
      rockRotation.y,
      rockRotation.z,
      rockRotation.w,
    );

    // Threshold to send socket and track position changes
    const POSITION_THRESHOLD = 0.01;
    const ROCK_POSITION_THRESHOLD = 0.002;
    const isPositionChanged =
      lastPosition.current.distanceTo(translation) > POSITION_THRESHOLD;
    const isRockPositionChanged =
      lastRockPosition.current.distanceTo(rockTranslation) >
      ROCK_POSITION_THRESHOLD;
    const isRockRotationChanged = !areQuaternionsEqual(
      lastRockRotation.current,
      rockQuat,
      0.01,
    );

    const direction = new THREE.Vector3();
    let serverRotation = {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
      w: rotation.w,
    };

    const activeInteractionAtom = activeInteractionFamily(player.fid);
    const activeInteraction = clientStore.get(activeInteractionAtom);
    const activeInteractionResult = handleActiveInteraction({
      activeInteraction,
      elapsedTime: state.clock.elapsedTime,
      camera: state.camera,
    });
    if (activeInteractionResult) {
      const { slerpedQuat } = activeInteractionResult;
      serverRotation = {
        x: slerpedQuat.x,
        y: slerpedQuat.y,
        z: slerpedQuat.z,
        w: slerpedQuat.w,
      };
    }

    const { forward, backward, left, right, jump } = get();
    const movementLock = getMovementLock({
      keyboardControls: { forward, backward, left, right, jump },
    });
    const interactionAnimEnded =
      preInteractionRotation.current === null ||
      areQuaternionsEqual(
        new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
        preInteractionRotation.current,
      ); // Check if position/rotation returned to pre-interaction state, modify and allow modify them only after that to assure smooth interpolation

    if (!movementLock.isLocked) {
      let moveX = joystick.x ?? 0;
      let moveZ = joystick.y ? -joystick.y : 0;

      if (forward) moveZ -= 1;
      if (backward) moveZ += 1;
      if (left) moveX -= 1;
      if (right) moveX += 1;

      const movementSpeed = getMovementSpeed(joystick.distance);
      movementSpeedRef.current = movementSpeed.animationSpeed;

      const movementDirection = getMovementDirection(
        new THREE.Vector3(moveX, 0, moveZ),
        state.camera,
      );
      direction.copy(movementDirection.direction);

      const { targetQuat, slerpedQuat } = getMovementRotation({
        direction,
        angle: movementDirection.angle,
        rigidbody: ref.current,
        keyboardControls: { forward, backward, left, right, jump },
      });
      currentRotation.current = slerpedQuat;
      serverRotation = {
        x: targetQuat.x,
        y: targetQuat.y,
        z: targetQuat.z,
        w: targetQuat.w,
      };

      direction.multiplyScalar(movementSpeed.walkingSpeed);

      if (interactionAnimEnded) {
        ref.current.setRotation(slerpedQuat, true);
        ref.current.setLinvel(
          { x: direction.x, y: velocity.y, z: direction.z },
          true,
        );
      }
    }

    const isMoving = direction.lengthSq() > 0;

    // Handle jumping
    const { interior } = clientStore.get(locationAtom);
    let grounded = interior !== null;
    if (!grounded) {
      const ray = rapier.world.castRay(
        new RAPIER.Ray(
          { x: translation.x, y: translation.y - 1, z: translation.z },
          { x: 0, y: -1, z: 0 },
        ),
        1,
        false,
        undefined,
        undefined,
        undefined,
        rockRef.current,
      );
      grounded = Boolean(ray && ray.collider);
    }

    if (isFirstGrounded.current && grounded) {
      isFirstGrounded.current = false;
      soundManager.playSound(Sound.POP_3, 0.3);
    }

    const jumpTrigger = clientStore.get(jumpTriggerAtom);
    if (
      (jump || jumpTrigger) &&
      !isJumpOnCooldownRef.current &&
      !movementLock.isLocked &&
      interior === null
    ) {
      soundManager.playSound(Sound.POP_3, 0.1);
      isJumpOnCooldownRef.current = true;
      ref.current.applyImpulse({ x: 0, y: mass * JUMP_HEIGHT, z: 0 }, true);

      setTimeout(() => {
        isJumpOnCooldownRef.current = false;
      }, 100);
    }

    if (isMoving && !isPlayingFootstepsRef.current && grounded) {
      isPlayingFootstepsRef.current = true;

      footstepIntervalRef.current = setInterval(() => {
        soundManager.playSound(
          interior ? Sound.FOOTSTEP_WOOD : Sound.FOOTSTEP_GRASS,
          0.05,
        );
      }, 650);
    } else if (!isMoving || !grounded) {
      isPlayingFootstepsRef.current = false;

      if (footstepIntervalRef.current) {
        clearInterval(footstepIntervalRef.current);
        footstepIntervalRef.current = null;
      }
    }

    const translationOffset = playerSkinSettings.translationOffset;
    ropeStartPos.set(
      translation.x + translationOffset.x,
      translation.y + translationOffset.y,
      translation.z,
    );
    ropeEndPos.set(rockTranslation.x, rockTranslation.y, rockTranslation.z);

    if (
      isPositionChanged ||
      isRockPositionChanged ||
      isRockRotationChanged ||
      activeInteraction ||
      preInteractionRotation.current
    ) {
      const wsManager = clientStore.get(wsManagerAtom);
      wsManager?.updatePosition({
        position: { x: translation.x, y: translation.y, z: translation.z },
        rotation: serverRotation,
        rockPosition: {
          x: rockTranslation.x,
          y: rockTranslation.y,
          z: rockTranslation.z,
        },
        rockRotation: {
          x: rockQuat.x,
          y: rockQuat.y,
          z: rockQuat.z,
          w: rockQuat.w,
        },
        joystick,
      });
    }

    // Update local player state
    gameStore.updatePlayerState(player.id, {
      position: translation,
      rotation,
      rockPosition: rockTranslation,
      rockRotation: rockRotation,
      joystick,
    });

    // Update last positions to track if position is changing
    lastPosition.current.set(translation.x, translation.y, translation.z);
    lastRockPosition.current.set(
      rockTranslation.x,
      rockTranslation.y,
      rockTranslation.z,
    );
    lastRockRotation.current.copy(rockQuat);

    // Update isMoving state
    clientStore.set(isMovingFamily(player.id), isMoving);
  });

  const handleNewInteraction = (
    interaction: PerformedInteraction,
    camera: THREE.Camera,
  ) => {
    const { type: interactionType } = interaction;

    const gameState = useGameStore.getState();
    const sourcePlayerPos = gameState.getPlayerState(
      interaction.sourceFid.toString(),
    );
    const targetPlayerPos = gameState.getPlayerState(
      interaction.targetFid.toString(),
    );

    if (!sourcePlayerPos || !targetPlayerPos || !rockRef.current) return;

    const sourcePosition = new THREE.Vector3(
      sourcePlayerPos.position.x,
      sourcePlayerPos.position.y,
      sourcePlayerPos.position.z,
    );
    const targetPosition = new THREE.Vector3(
      targetPlayerPos.position.x,
      targetPlayerPos.position.y,
      targetPlayerPos.position.z,
    );

    // Calculate target camera position based on interaction type
    const isCameraActionNeeded = [
      ...SINGLE_FOCUS_INTERACTIONS,
      ...DUAL_FOCUS_INTERACTIONS,
    ].includes(interaction.type);
    let targetCamera;
    if (
      SINGLE_FOCUS_INTERACTIONS.includes(interaction.type as InteractionType)
    ) {
      // Focus on the target player (the one being interacted with)
      let focusPlayer =
        player.fid === interaction.sourceFid ? targetPosition : sourcePosition;

      // Don't move camera for target when admiring rock
      if (
        interaction.type === InteractionType.ADMIRE_ROCK &&
        interaction.targetFid === player.fid
      ) {
        focusPlayer = targetPosition;
      }
      targetCamera = calculateSingleFocusCamera({
        targetPosition: focusPlayer,
        interactionType,
      });
    } else if (
      DUAL_FOCUS_INTERACTIONS.includes(interaction.type as InteractionType)
    ) {
      // Frame both players
      targetCamera = calculateDualFocusCamera({
        sourcePosition,
        targetPosition,
        interactionType,
      });
    } else {
      // Default to dual focus
      targetCamera = calculateDualFocusCamera({
        sourcePosition,
        targetPosition,
        interactionType,
      });
    }

    lastInteractionId.current = interaction.id;

    cameraControls.startAnimation({
      sourcePosition: camera.position,
      targetPosition: isCameraActionNeeded
        ? targetCamera.position
        : camera.position,
      lookAt: targetCamera.target,
      durations: {
        hold: getInteractionDuration(interaction.type),
      },
    });
  };

  return (
    <group>
      <Character
        isCurrentPlayer
        ref={ref}
        hudRef={hudRef}
        rockRef={rockRef}
        colliderRef={colliderRef}
        position={initialPosition}
        movementSpeed={movementSpeedRef.current}
        player={player}
        rope={rope}
        onPlayerClick={onPlayerClick}
        onRockPointerDown={handleRubStart}
        onRockPointerMove={handleRubMove}
        onRockPointerUp={handleRubEnd}
        onRockPointerLeave={handleRubEnd}
      />

      <CameraControlPlane
        ref={controlPlaneRef}
        onPointerDown={controlPlane.onControlPlaneFocus}
        onPointerMove={controlPlane.onControlPlaneMove}
        onPointerLeave={controlPlane.onControlPlaneBlur}
        onPointerUp={controlPlane.onControlPlaneBlur}
      />
    </group>
  );
};
