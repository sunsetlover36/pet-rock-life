import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { cloneSkinned } from "~/config/skeleton-utils";

// Global shared resources
let sharedDogScene: THREE.Group | null = null;
let sharedDogAnimations: THREE.AnimationClip[] = [];
let sharedDogMaterials: THREE.Material[] = [];
let sharedDogGeometries: Map<string, THREE.BufferGeometry> = new Map();

// Initialize shared resources once
export const initializeSharedDogResources = () => {
  if (sharedDogScene) return;

  const { scene, animations } = useGLTF("/skins/skin_dog.glb") as any;

  sharedDogScene = scene;
  sharedDogAnimations = animations;

  // Extract and store all materials
  const materials = new Set<THREE.Material>();
  scene.traverse((child: any) => {
    if (child.isMesh) {
      // Store materials
      if (Array.isArray(child.material)) {
        child.material.forEach((mat: THREE.Material) => materials.add(mat));
      } else {
        materials.add(child.material);
      }

      // Store geometries by name for sharing
      sharedDogGeometries.set(child.name || child.uuid, child.geometry);
    }
  });
  sharedDogMaterials = Array.from(materials);
};

// Hook to get shared resources
export const useSharedDogResources = () => {
  const resources = useMemo(() => {
    initializeSharedDogResources();
    return {
      scene: sharedDogScene,
      animations: sharedDogAnimations,
      materials: sharedDogMaterials,
    };
  }, []);

  return resources;
};

/**
 * THE KEY SOLUTION: Clone skeleton but share geometry & materials
 * This prevents VRAM bloat while allowing independent animations
 */
export const createOptimizedDogClone = (
  source: THREE.Group,
  sharedMaterials: THREE.Material[],
): THREE.Group => {
  // 1. Clone skeleton/bones for independent animations
  const clone = cloneSkinned(source) as THREE.Group;

  // 2. Replace materials with shared instances
  const materialMap = new Map<string, THREE.Material>();
  sharedMaterials.forEach((mat) => {
    materialMap.set(mat.name || mat.uuid, mat);
  });

  clone.traverse((obj: any) => {
    if (!obj.isMesh) return;

    // Share materials
    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map(
        (mat: THREE.Material) => materialMap.get(mat.name || mat.uuid) || mat,
      );
    } else {
      obj.material =
        materialMap.get(obj.material.name || obj.material.uuid) || obj.material;
    }

    // 3. CRITICAL: Share geometries to prevent VRAM bloat
    const sharedGeometry = sharedDogGeometries.get(obj.name || obj.uuid);
    if (sharedGeometry) {
      obj.geometry = sharedGeometry; // Multiple clones = same VBO
    }
  });

  return clone;
};

// Enhanced Dog component with proper cleanup
export function OptimizedDog(props: any) {
  const { isMoving = false, movementSpeed = 1, ...restProps } = props;
  const group = useRef<THREE.Group>(null);
  const { scene, animations, materials } = useSharedDogResources();

  // Create optimized clone
  const clone = useMemo(() => {
    if (!scene || !materials) return null;
    return createOptimizedDogClone(scene, materials);
  }, [scene, materials]);

  // Proper cleanup on unmount
  useEffect(() => {
    return () => {
      // Only dispose materials that aren't shared, geometry is shared so DON'T dispose
      group.current?.traverse((obj: any) => {
        if (!obj.isMesh) return;

        // Geometry is shared - do NOT dispose it!
        // Materials might be shared too, but dispose if not in shared set
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat: THREE.Material) => {
            if (!materials.includes(mat)) {
              mat.dispose();
            }
          });
        } else if (obj.material && !materials.includes(obj.material)) {
          obj.material.dispose();
        }
      });
    };
  }, [materials]);

  // Animation logic (same as before)
  const { actions } = useAnimations(animations, group);
  const [isCurrentlyMoving, setIsCurrentlyMoving] = useState(false);

  useEffect(() => {
    if (actions.walk) {
      actions.walk.setLoop(THREE.LoopRepeat, Infinity);
    }
  }, [actions]);

  useFrame(() => {
    const walkAction = actions.walk;
    if (!walkAction) return;

    walkAction.setEffectiveTimeScale(movementSpeed);

    if (isMoving && !isCurrentlyMoving) {
      setIsCurrentlyMoving(true);
      walkAction.reset().fadeIn(0.2).play();
    } else if (!isMoving && isCurrentlyMoving) {
      setIsCurrentlyMoving(false);
      walkAction.fadeOut(0.2);
    }
  });

  if (!clone) return null;

  return (
    <group ref={group} scale={1.8} {...restProps} dispose={null}>
      <primitive object={clone} />
    </group>
  );
}

useGLTF.preload("/skins/skin_dog.glb");
