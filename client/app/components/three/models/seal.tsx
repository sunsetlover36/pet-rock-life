import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import type { Mesh } from 'three';

export function Seal(props: any) {
  const group = useRef(null);
  const { nodes, materials } = useGLTF('/skins/skin_seal.glb');

  return (
    <group ref={group} {...props}>
      <mesh
        name="Object_7"
        geometry={(nodes.Object_7 as Mesh).geometry}
        material={materials['01_-_Default']}
        position={[0, 0, 0]}
        scale={0.011}
      />
    </group>
  );
}
