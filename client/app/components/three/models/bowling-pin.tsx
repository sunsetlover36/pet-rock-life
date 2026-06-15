import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { InstancedRigidBodies } from '@react-three/rapier';
import type { Mesh } from 'three';

export interface BowlingPinData {
  position: [number, number, number];
  scale: [number, number, number];
}

// Extract bowling pin positions from your groups
const bowlingPinData: BowlingPinData[] = [
  {
    position: [-7.763, 16.549, -38.05],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-8.349, 16.549, -37.475],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-7.749, 16.549, -37.259],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-8.262, 16.549, -36.745],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-7.618, 16.549, -36.555],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-8.843, 16.549, -36.959],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-9.49, 16.549, -36.531],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-8.796, 16.549, -36.269],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-8.149, 16.549, -36.014],
    scale: [2.92, 2.92, 2.92],
  },
  {
    position: [-7.459, 16.549, -35.749],
    scale: [2.92, 2.92, 2.92],
  },
];

export function BowlingPins(props: { data?: BowlingPinData[] }) {
  const data = props.data || bowlingPinData;

  // Load bowling pin GLB file
  const { nodes, materials } = useGLTF('/bowling_pin.glb'); // Assuming you have a single bowling pin GLB

  const instances = useMemo(() => {
    return data.map((pin, i) => ({
      key: `bowling-pin-${i}`,
      position: pin.position as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: pin.scale,
      type: 'dynamic' as const, // Dynamic so they can be knocked over!
    }));
  }, [data]);

  // Get the bowling pin geometry (adjust the key based on your GLB structure)
  const pinGeometry = useMemo(() => {
    // Try common bowling pin mesh names
    const possibleKeys = ['bowling_pin', 'bowling_pin_1', 'Bowling_Pin', 'pin'];

    for (const key of possibleKeys) {
      if (nodes[key]) {
        return (nodes[key] as Mesh).geometry;
      }
    }

    // If none found, use the first available mesh
    const firstMeshKey = Object.keys(nodes).find(
      (key) => (nodes[key] as Mesh).geometry
    );
    if (firstMeshKey) {
      return (nodes[firstMeshKey] as Mesh).geometry;
    }

    console.warn(
      'No bowling pin geometry found. Available nodes:',
      Object.keys(nodes)
    );
    return null;
  }, [nodes]);

  // Get the bowling pin material
  const pinMaterial = useMemo(() => {
    return (
      materials['atlas_Built-in'] ||
      materials.Material ||
      Object.values(materials)[0]
    );
  }, [materials]);

  if (!pinGeometry) {
    return null;
  }

  return (
    <InstancedRigidBodies
      colliders="cuboid" // Automatic collision detection based on mesh shape
      instances={instances}
      restitution={0.3} // Some bounciness
      friction={0.7} // Good friction so they don't slide too much
    >
      <instancedMesh
        args={[pinGeometry, pinMaterial, instances.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
    </InstancedRigidBodies>
  );
}

// Preload GLB files

useGLTF.preload('/bowling_pin.glb');
