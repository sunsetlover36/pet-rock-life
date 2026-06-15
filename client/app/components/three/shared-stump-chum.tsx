import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";
import { cloneSkinned } from "~/config/skeleton-utils";

// Global shared resources
let sharedStumpChumScene: THREE.Group | null = null;
let sharedStumpChumAnimations: THREE.AnimationClip[] = [];
let sharedStumpChumMaterials: THREE.Material[] = [];
let sharedStumpChumGeometries: Map<string, THREE.BufferGeometry> = new Map();

// Initialize shared resources once
export const initializeSharedStumpChumResources = () => {
  if (sharedStumpChumScene) return;

  const { scene, animations } = useGLTF("/skins/skin_stumpchum.glb") as any;

  sharedStumpChumScene = scene;
  sharedStumpChumAnimations = animations;

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
      sharedStumpChumGeometries.set(child.name || child.uuid, child.geometry);
    }
  });
  sharedStumpChumMaterials = Array.from(materials);
};

// Hook to get shared resources
export const useSharedStumpChumResources = () => {
  const resources = useMemo(() => {
    initializeSharedStumpChumResources();
    return {
      scene: sharedStumpChumScene,
      animations: sharedStumpChumAnimations,
      materials: sharedStumpChumMaterials,
    };
  }, []);

  return resources;
};

/**
 * Clone skeleton but share geometry & materials
 * This prevents VRAM bloat while allowing independent transforms
 */
export const createOptimizedStumpChumClone = (
  source: THREE.Group,
  sharedMaterials: THREE.Material[],
): THREE.Group => {
  // 1. Clone skeleton/bones for independent animations and transforms
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
    const sharedGeometry = sharedStumpChumGeometries.get(obj.name || obj.uuid);
    if (sharedGeometry) {
      obj.geometry = sharedGeometry; // Multiple clones = same VBO
    }
  });

  return clone;
};

useGLTF.preload("/skins/skin_stumpchum.glb");
