import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { useAtomValue } from "jotai";
import { currentPlayerAtom, useGameStore, locationAtom } from "~/store";
import { clientStore } from "~/store";
import { soundManager } from "~/services/sound-manager";
import { Area, Interior, Sound } from "~/types";

const EXIT_ZONE_POSITION = new Vector3(-14, 3.3, 10);
const EXIT_ZONE_SIZE = 3; // Half the size of the red box

export const BarExitZone = () => {
  const profile = useAtomValue(currentPlayerAtom);
  const playerPosition = useRef<Vector3>(new Vector3());
  const hasTriggered = useRef(false);

  useFrame(() => {
    if (!profile) return;

    const { interior } = clientStore.get(locationAtom);
    if (interior !== Interior.BAR) {
      hasTriggered.current = false;
      return;
    }

    const { position } = useGameStore
      .getState()
      .getPlayerState(profile?.id) ?? {
      position: { x: 0, y: 0, z: 0 },
    };

    const positionVector = new Vector3(position.x, position.y, position.z);
    playerPosition.current.copy(positionVector);

    // Adjust position relative to bar location (1000, 0, 1000)
    const relativePosition = new Vector3(
      position.x - 1000,
      position.y,
      position.z - 1000,
    );

    // Check if player is within the exit zone
    const distance = relativePosition.distanceTo(EXIT_ZONE_POSITION);
    const isInExitZone = distance <= EXIT_ZONE_SIZE;

    if (isInExitZone && !hasTriggered.current) {
      hasTriggered.current = true;
      console.log("Player entered bar exit zone, teleporting to village");
      clientStore.set(locationAtom, {
        area: Area.VILLAGE,
        interior: null,
      });
      soundManager.playSound(Sound.DOOR_OPEN, 0.05);
      soundManager.resumeBackgroundMusic();
    } else if (!isInExitZone && hasTriggered.current) {
      hasTriggered.current = false;
    }
  });

  return (
    <mesh position={[-15.5, 4.5, 10]}>
      <boxGeometry args={[0.4, 6, 4]} />
      <meshBasicMaterial color="#361a17" />
    </mesh>
  );
};
