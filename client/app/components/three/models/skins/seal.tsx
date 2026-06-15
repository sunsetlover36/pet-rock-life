import { useEffect, useRef, type FC } from "react";
import { useGLTF } from "@react-three/drei";
import type { Mesh, Group } from "three";

interface SealProps {
  hatModelPath?: string;
  hatConfig?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}
export const Seal: FC<SealProps> = ({ hatModelPath, hatConfig, ...props }) => {
  const group = useRef(null);
  const { nodes, materials } = useGLTF("/skins/skin_seal.glb");

  const hatScene = hatModelPath ? useGLTF(hatModelPath).scene : null;
  const hatRef = useRef<Group>(null);

  useEffect(() => {
    if (!hatRef.current || !hatConfig) return;

    hatRef.current.position.set(...(hatConfig.position ?? [0, 0, 0]));
    hatRef.current.rotation.set(...(hatConfig.rotation ?? [0, 0, 0]));
    hatRef.current.scale.set(...(hatConfig.scale ?? [1, 1, 1]));
  }, [hatConfig]);

  return (
    <group ref={group} {...props}>
      <mesh
        castShadow
        receiveShadow
        name="Object_7"
        geometry={(nodes.Object_7 as Mesh).geometry}
        material={materials["01_-_Default"]}
        position={[0, 0, 0]}
        scale={0.011}
      />

      {hatScene && (
        <group ref={hatRef}>
          <primitive object={hatScene.clone()} />
        </group>
      )}
    </group>
  );
};

useGLTF.preload("/skins/skin_seal.glb");
