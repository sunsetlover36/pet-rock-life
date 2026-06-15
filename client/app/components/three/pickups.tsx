import { useRef, type FC } from "react";
import { Arrow } from "./models";
import { useFrame } from "@react-three/fiber";
import { type Mesh } from "three";
import { Center } from "@react-three/drei";
import { useAtomValue, useSetAtom } from "jotai";
import { activeScenarioIdAtom, locationAtom, worldMetadataAtom } from "~/store";
import { soundManager } from "~/services/sound-manager";
import {
  CuboidCollider,
  RigidBody,
  type IntersectionEnterHandler,
} from "@react-three/rapier";
import {
  Area,
  Interior,
  ScenarioId,
  BackgroundMusic,
  RigidBodyType,
  Sound,
} from "~/types";
import { COLLISION_GROUPS } from "~/config/physics";

enum PickupType {
  ARROW,
  MARKER,
}
interface PickupProps {
  type?: PickupType;
  id: string;
  position: [number, number, number];
  onEnter?: () => void;
}
export const Pickup: FC<PickupProps> = ({
  type = PickupType.ARROW,
  position,
  onEnter,
}) => {
  const arrowRef = useRef<Mesh>(null);
  const isArrow = type === PickupType.ARROW;
  const lastActivationTime = useRef(0);

  const onIntersectionEnter: IntersectionEnterHandler = (e) => {
    const otherRigidBody = e.other.rigidBodyObject;

    if (
      Date.now() - lastActivationTime.current > 1000 &&
      arrowRef.current &&
      otherRigidBody?.userData?.name === RigidBodyType.PLAYER
    ) {
      arrowRef.current.visible = false;
      onEnter?.();
    }
  };
  const onIntersectionExit: IntersectionEnterHandler = (e) => {
    const otherRigidBody = e.other.rigidBodyObject;

    if (
      arrowRef.current &&
      otherRigidBody?.userData?.name === RigidBodyType.PLAYER
    ) {
      lastActivationTime.current = Date.now();
      arrowRef.current.visible = true;
    }
  };

  useFrame((state, delta) => {
    if (!arrowRef.current) return;

    if (isArrow) {
      arrowRef.current.rotation.y += delta;
    }

    const bounceHeight = isArrow ? 0.2 : 0.1;
    const bounceSpeed = 2.5;
    arrowRef.current.position.y =
      Math.sin(state.clock.elapsedTime * bounceSpeed) * bounceHeight;
  });

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders={false}
      onIntersectionEnter={onIntersectionEnter}
      onIntersectionExit={onIntersectionExit}
    >
      <group ref={arrowRef}>
        <CuboidCollider sensor args={[1, 1, 1]} />

        <Center>
          {isArrow ? (
            <Arrow />
          ) : (
            <mesh>
              <cylinderGeometry args={[1, 1, 2, 16]} />
              <meshStandardMaterial
                color="green"
                emissive="green"
                emissiveIntensity={5}
                transparent
                opacity={0.3}
              />
            </mesh>
          )}
        </Center>
      </group>
    </RigidBody>
  );
};

export const Pickups = () => {
  const worldMetadata = useAtomValue(worldMetadataAtom);
  const setLocation = useSetAtom(locationAtom);
  const setActiveScenarioId = useSetAtom(activeScenarioIdAtom);

  const onBlueTavernEnter = () => {
    setLocation({
      area: Area.VILLAGE,
      interior: Interior.BAR,
    });
    soundManager.playSound(Sound.DOOR_OPEN, 0.1);
    soundManager.playMusicTrack(BackgroundMusic.TRACK_9, {
      loop: true,
    });
  };
  const onTownHallEnter = () => {
    setLocation({
      area: Area.VILLAGE,
      interior: Interior.TOWN_HALL,
    });
    soundManager.playSound(Sound.DOOR_OPEN, 0.05);
    soundManager.playMusicTrack(BackgroundMusic.TRACK_10, {
      loop: true,
    });
  };
  const onTownHallExit = () => {
    setLocation({
      area: Area.VILLAGE,
      interior: null,
    });
    soundManager.playSound(Sound.DOOR_OPEN, 0.05);
    soundManager.resumeBackgroundMusic();
  };
  const onPassportMarkerEnter = () => {
    console.log("Set scenario");
    setActiveScenarioId(ScenarioId.PASSPORT);
  };

  if (!worldMetadata) {
    return null;
  }

  const { interiors } = worldMetadata;
  const blueTavern = interiors[Interior.BAR];
  const townHall = interiors[Interior.TOWN_HALL];

  return (
    <>
      <Pickup
        id="blue-tavern-enter"
        position={blueTavern.pickups.enter}
        onEnter={onBlueTavernEnter}
      />
      <Pickup id="blue-tavern-exit" position={blueTavern.pickups.exit} />

      <Pickup
        id="town-hall-enter"
        position={townHall.pickups.enter}
        onEnter={onTownHallEnter}
      />
      <Pickup
        id="town-hall-exit"
        position={townHall.pickups.exit}
        onEnter={onTownHallExit}
      />

      <Pickup
        id="get-passport"
        type={PickupType.MARKER}
        position={townHall.pickups.passport}
        onEnter={onPassportMarkerEnter}
      />
    </>
  );
};
