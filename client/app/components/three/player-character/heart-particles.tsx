import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type FC } from "react";
import * as THREE from "three";
import {
  activeInteractionFamily,
  cameraAnimStateAtom,
  clientStore,
} from "~/store";
import { InteractionType } from "~/types";

const SIZE = 0.3;

interface HeartParticlesProps {
  playerId: number;
  count: number;
}
export const HeartParticles: FC<HeartParticlesProps> = ({
  playerId,
  count,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const originalPositions = useRef<Float32Array>(null);

  const heartTexture = useTexture("/icons/heart.png");
  heartTexture.generateMipmaps = false;
  heartTexture.minFilter = THREE.LinearFilter;
  heartTexture.magFilter = THREE.LinearFilter;

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = Math.random() * 2 - 1;
      positions[i3 + 1] = Math.random() * 1.25;
      positions[i3 + 2] = Math.random() * 2 - 1;
    }

    originalPositions.current = positions;
    return { positions };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !originalPositions.current) return;

    const activeInteraction = clientStore.get(
      activeInteractionFamily(playerId),
    );
    const cameraAnimState = clientStore.get(cameraAnimStateAtom);
    const isZoomingIn =
      cameraAnimState && cameraAnimState.phase === "zooming_in";

    let isVisible = false;
    if (
      activeInteraction?.type === InteractionType.ADMIRE_ROCK &&
      activeInteraction.targetFid === playerId
    ) {
      isVisible = true;
    } else if (
      (activeInteraction?.type === InteractionType.RITUAL ||
        activeInteraction?.type === InteractionType.KISS) &&
      !isZoomingIn
    ) {
      isVisible = true;
    }

    if (isVisible) {
      pointsRef.current.visible = true;
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const y = positions[i3 + 1];

        positions[i3 + 2] = Math.sin(
          originalPositions.current[i3 + 2] + state.clock.elapsedTime * 0.5,
        );
        positions[i3 + 1] = y > 1.5 ? 0 : y + delta * 0.3;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    } else {
      pointsRef.current.visible = false;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <pointsMaterial
        map={heartTexture}
        size={0.3}
        color="#F45B69"
        transparent
        alphaTest={0.1}
        depthWrite={false}
      />
    </points>
  );
};
