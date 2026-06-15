import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";
import { HAT_CONFIGS } from "~/config/hats";

interface HatModelProps {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  autorotate?: boolean;
}

export const HatModel = ({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  autorotate,
}: HatModelProps) => {
  const ref = useRef<Mesh>(null);

  const { scene } = useGLTF(modelPath);

  useFrame((_, delta) => {
    if (autorotate && ref.current) {
      ref.current.rotation.y += delta;
    }
  });

  return (
    <group ref={ref} scale={scale} position={position} rotation={rotation}>
      <primitive object={scene.clone()} />
    </group>
  );
};

Object.values(HAT_CONFIGS).forEach((cfg) => {
  if (cfg.modelPath) {
    useGLTF.preload(cfg.modelPath);
  }
});
