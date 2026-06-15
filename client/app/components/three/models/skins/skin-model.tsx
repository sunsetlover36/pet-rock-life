import { useRef, type JSX } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { PlayerSkin } from "~/types";
import { Seal } from "./seal";
import { Dog } from "./dog";
import { StumpChum } from "./stump-chum";
import { Warplet } from "./warplet";

interface SkinModelProps {
  playerId: string;
  skin: PlayerSkin;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  autorotate?: boolean;
}

export const SkinModel = ({
  playerId,
  skin,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  autorotate = true,
}: SkinModelProps) => {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (autorotate && ref.current) {
      ref.current.rotation.y += delta;
    }
  });

  let CharacterModel = null;
  switch (skin) {
    case PlayerSkin.DOG:
      CharacterModel = Dog;
      break;
    case PlayerSkin.STUMP_CHUM:
      CharacterModel = StumpChum;
      break;
    case PlayerSkin.WARPLET:
      CharacterModel = Warplet;
      break;
    default:
      CharacterModel = Seal;
      break;
  }

  return (
    <CharacterModel
      playerId={playerId}
      ref={ref}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
};
