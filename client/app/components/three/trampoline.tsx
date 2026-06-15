import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useRef, useState } from "react";
import type { Mesh } from "three";
import { soundManager } from "~/services/sound-manager";
import { Sound } from "~/types";

export const Trampoline = () => {
  const { nodes, materials } = useGLTF("/trampoline.glb");

  const trampolineRef = useRef<RapierRigidBody>(null);
  const [bounceScale, setBounceScale] = useState(1);

  // Animate trampoline bounce effect
  useFrame((_, delta) => {
    if (bounceScale !== 1) {
      // Animate back to normal size
      const newScale = bounceScale + (1 - bounceScale) * delta * 5;
      setBounceScale(Math.abs(newScale - 1) < 0.01 ? 1 : newScale);
    }
  });

  const handleCollision = () => {
    setBounceScale(0.7);
    soundManager.playSound(Sound.TRAMPOLINE_JUMP, 0.13);
  };

  materials["atlas_Built-in"].emissiveIntensity = 0.7;
  return (
    <RigidBody
      ref={trampolineRef}
      type="fixed"
      colliders={false}
      position={[22.347, -0.31, -13.241]}
      scale={[2, 1.3, 2]}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[3, 2.1, 3]} />
      <CuboidCollider
        args={[3, 0.2, 3]}
        position={[0, 2, 0]}
        sensor={false}
        restitution={3.5}
        friction={0.07}
      />
      <mesh
        geometry={(nodes.trampoline as Mesh).geometry}
        material={materials["atlas_Built-in"]}
        scale={[6, 6 * bounceScale, 6]}
      />
    </RigidBody>
  );
};
