import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { PlayerHat } from '~/types';
import type { HatConfig } from '~/config/hats';

interface HatPlaceholderProps {
  config: HatConfig;
  scale?: number;
}

export const HatPlaceholder = ({ config, scale = 2 }: HatPlaceholderProps) => {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
    }
  });

  if (config.id === PlayerHat.NONE) {
    return null;
  }

  return (
    <mesh ref={ref} scale={[scale, scale, scale]} position={[0, 0.5, 0]}>
      <boxGeometry args={[0.6, 0.3, 0.6]} />
      <meshStandardMaterial color={config.meshColor} />
    </mesh>
  );
};
