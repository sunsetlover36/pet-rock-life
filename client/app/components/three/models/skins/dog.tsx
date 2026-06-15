import React, { useRef, useMemo, useEffect } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useSharedDogResources,
  createOptimizedDogClone,
} from "~/components/three/shared-dog";
import { clientStore, isMovingFamily } from "~/store";

enum DogAnimations {
  bark = "bark",
  walk = "walk",
}

interface DogProps {
  hatModelPath?: string;
  hatConfig?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  playerId: string;
  movementSpeed?: number;
  [key: string]: any;
}

export const Dog: React.FC<DogProps> = ({
  playerId,
  hatModelPath,
  hatConfig,
  movementSpeed = 1,
  ...restProps
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations, materials } = useSharedDogResources();

  const hatRef = useRef<THREE.Group>(null);
  const hatScene = hatModelPath ? useGLTF(hatModelPath).scene : null;

  // Create optimized clone with shared materials
  const clone = useMemo(() => {
    if (!scene || !materials) return null;
    return createOptimizedDogClone(scene, materials);
  }, [scene, materials]);

  const { actions } = useAnimations(animations, group);
  const isPlayingRef = useRef(false);

  // Get atom reference (doesn't subscribe to changes)
  const isMovingAtom = useMemo(() => isMovingFamily(playerId), [playerId]);

  useFrame(() => {
    const isMoving = clientStore.get(isMovingAtom);
    const walkAction = actions[DogAnimations.walk];

    if (!walkAction) return;

    // Set animation speed
    walkAction.setEffectiveTimeScale(movementSpeed);

    // Start walking animation
    if (isMoving && !isPlayingRef.current) {
      isPlayingRef.current = true;
      walkAction.reset().fadeIn(0.2).play();
      walkAction.setLoop(THREE.LoopRepeat, Infinity);
    }
    // Stop walking animation
    else if (!isMoving && isPlayingRef.current) {
      isPlayingRef.current = false;
      walkAction.fadeOut(0.2);
    }
  });
  useEffect(() => {
    if (!clone || !hatScene || !hatRef.current) return;

    let headBone: THREE.Bone | null = null;

    clone.traverse((child) => {
      if (child instanceof THREE.Bone && child.name === "head") {
        headBone = child;
      }
    });

    if (headBone) {
      if (hatRef.current.parent) {
        hatRef.current.parent.remove(hatRef.current);
      }

      // Attach to Head bone
      headBone.add(hatRef.current);

      hatRef.current.position.set(...(hatConfig.position ?? [0, 0, 0]));
      hatRef.current.rotation.set(...(hatConfig.rotation ?? [0, 0, 0]));
      hatRef.current.scale.set(...(hatConfig.scale ?? [1, 1, 1]));
    }
  }, [clone, hatScene, hatConfig]);

  if (!clone) return null;

  return (
    <group ref={group} {...restProps} dispose={null}>
      <primitive object={clone} scale={2} />

      {hatScene && (
        <group ref={hatRef}>
          <primitive object={hatScene.clone()} />
        </group>
      )}
    </group>
  );
};
