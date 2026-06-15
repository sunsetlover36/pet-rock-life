import React, { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import { clientStore, isMovingFamily } from "~/store";

enum WarpletAnimation {
  Idle = "Idle",
  Walk = "Walk",
}

interface WarpletProps {
  playerId: string;
  isIdle?: boolean;
  hatModelPath?: string;
  hatConfig?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}

// Shared resource hook - only loads GLTF once
const useSharedWarpletResources = () => {
  const { scene, animations, materials } = useGLTF("/skins/skin_warplet.glb");
  return { scene, animations, materials };
};

const createOptimizedClone = (
  scene: THREE.Group,
  materials: Record<string, THREE.Material>,
) => {
  const clone = SkeletonUtils.clone(scene);

  clone.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.material) {
      const materialName = (child.material as THREE.Material).name;
      if (materials[materialName]) {
        const material = materials[materialName];

        material.emissiveIntensity = 0.9;
        material.roughness = 1;
        material.metalness = 0;

        child.material = material;
      }
    }
  });

  return clone;
};

export const Warplet: React.FC<WarpletProps> = ({
  playerId,
  hatModelPath,
  hatConfig = {},
  isIdle = false,
  ...props
}) => {
  const group = useRef<THREE.Group>(null);
  const hatRef = useRef<THREE.Group>(null);
  const { scene, animations, materials } = useSharedWarpletResources();

  const hatScene = hatModelPath ? useGLTF(hatModelPath).scene : null;

  // Create optimized clone with shared materials
  const clonedScene = useMemo(() => {
    if (!scene || !materials) return null;
    return createOptimizedClone(scene, materials);
  }, [scene, materials]);

  const { actions } = useAnimations(animations, group);
  const currentAnimationRef = useRef<string | null>(null);

  // Get atom reference (doesn't subscribe to changes)
  const isMovingAtom = useMemo(() => isMovingFamily(playerId), [playerId]);

  useEffect(() => {
    if (!clonedScene || !hatScene || !hatRef.current) return;

    let headBone: THREE.Bone | null = null;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Bone && child.name === "Head") {
        headBone = child;
      }
    });

    if (headBone) {
      // Remove from current parent if any
      if (hatRef.current.parent) {
        hatRef.current.parent.remove(hatRef.current);
      }

      // Attach to Head bone
      headBone.add(hatRef.current);

      hatRef.current.position.set(...(hatConfig.position ?? [0, 0, 0]));
      hatRef.current.rotation.set(...(hatConfig.rotation ?? [0, 0, 0]));
      hatRef.current.scale.set(...(hatConfig.scale ?? [1, 1, 1]));
    }
  }, [clonedScene, hatScene, hatConfig]);
  useFrame(() => {
    // Read atoms directly in useFrame
    const isMoving = clientStore.get(isMovingAtom);

    let targetAnimation: string | null = null;

    if (isMoving) {
      targetAnimation = WarpletAnimation.Walk;
    } else if (isIdle) {
      targetAnimation = WarpletAnimation.Idle;
    }

    // Only update if animation changed
    if (targetAnimation !== currentAnimationRef.current) {
      const prevAction = currentAnimationRef.current
        ? actions[currentAnimationRef.current]
        : null;
      const currentAction = targetAnimation ? actions[targetAnimation] : null;

      if (prevAction?.isRunning()) {
        prevAction.stop();
      }

      if (currentAction && !currentAction.isRunning()) {
        currentAction.reset().play();
      }

      currentAnimationRef.current = targetAnimation;
    }
  });

  if (!clonedScene) return null;

  return (
    <group ref={group} {...props} dispose={null} scale={0.6}>
      <primitive object={clonedScene} />
      {hatScene && (
        <group ref={hatRef}>
          <primitive object={hatScene.clone()} />
        </group>
      )}
    </group>
  );
};

useGLTF.preload("/skins/skin_warplet.glb");
