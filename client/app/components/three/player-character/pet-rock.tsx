import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import {
  BallCollider,
  RapierCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import {
  activeInteractionFamily,
  cameraAnimStateAtom,
  clientStore,
  uiModeAtom,
} from "~/store";
import { ageManager } from "~/services/age-manager";
import { HeartParticles } from "./heart-particles";
import { InteractionType, RigidBodyType, UIMode } from "~/types";
import { Html } from "@react-three/drei";

// Helper function to calculate rock size based on age
const getRockSize = (ageInSeconds: number): number => {
  const baseSize = 1; // Starting size for main player's rock
  const days = ageInSeconds / 86400;
  const growthPerDay = 0.02; // Small growth per day (was 0.05)
  return baseSize + days * growthPerDay;
};

interface PetRockProps {
  position: [number, number, number];
  rigidbodyRef: React.RefObject<RapierRigidBody | null>;
  isCurrentPlayer?: boolean;
  rockName?: string;
  playerId: number;
  children?: ReactNode;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerEnter?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
}

export const PetRock = ({
  position,
  rigidbodyRef,
  isCurrentPlayer,
  playerId,
  children,
  rockName,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  onPointerOver,
  onPointerOut,
}: PetRockProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const htmlGroupRef = useRef<THREE.Group>(null);
  const htmlContentRef = useRef<HTMLDivElement>(null);
  const colliderRef = useRef<RapierCollider>(null);

  const rockPosition = useRef(new THREE.Vector3(0, 0, 0));
  const lastUpdatedAge = useRef(ageManager.getPlayerAge(playerId.toString()));
  const isScaleUpdated = useRef(false);
  const lastHue = useRef(0);

  useFrame((state) => {
    if (!rigidbodyRef.current || !meshRef.current || !colliderRef.current)
      return;

    const translation = rigidbodyRef.current.translation();
    rockPosition.current.set(translation.x, translation.y, translation.z);

    if (htmlGroupRef.current) {
      htmlGroupRef.current.position.set(
        translation.x - 2,
        translation.y - 2.1,
        translation.z,
      );
      htmlGroupRef.current.updateMatrix();
      htmlGroupRef.current.updateMatrixWorld(true);
    }

    const currentAge = ageManager.getPlayerAge(playerId.toString());
    const uiMode = clientStore.get(uiModeAtom);

    if (htmlContentRef.current) {
      if (uiMode !== UIMode.GAMEPLAY) {
        htmlContentRef.current.style.display = "none";
      } else {
        htmlContentRef.current.style.display = "block";
      }
    }
    if (currentAge !== lastUpdatedAge.current) {
      // const ageElement = htmlContentRef.current.querySelector('.age-display');
      // if (ageElement) {
      //   ageElement.textContent = formatAge(currentAge);
      // }
      lastUpdatedAge.current = currentAge;
    }

    if (!isScaleUpdated.current && currentAge !== 0) {
      isScaleUpdated.current = true;
      const rockSize = getRockSize(currentAge);
      meshRef.current.scale.set(rockSize, rockSize, rockSize);
      colliderRef.current.setRadius(rockSize / 2.5);
    }

    const activeInteractionAtom = activeInteractionFamily(playerId);
    const activeInteraction = clientStore.get(activeInteractionAtom);

    // Update material color dynamically
    const mesh = meshRef.current;
    if (mesh.material && "color" in mesh.material) {
      const material = mesh.material as THREE.MeshStandardMaterial;

      const cameraAnimState = clientStore.get(cameraAnimStateAtom);
      if (
        activeInteraction?.type === InteractionType.RITUAL &&
        cameraAnimState &&
        cameraAnimState.phase !== "zooming_in"
      ) {
        // Get current color for smooth transitions
        const currentColor = material.color.getHSL({ h: 0, s: 0, l: 0 });

        // Smooth transition from gray to rainbow
        const time = state.clock.elapsedTime;
        const hue = (time * 0.1) % 1;
        lastHue.current = hue;

        // Target rainbow color
        const targetSaturation = 0.8;
        const targetLightness = 0.6;

        // Smooth lerp from current to target (only saturation and lightness)
        const newSaturation = THREE.MathUtils.lerp(
          currentColor.s,
          targetSaturation,
          0.02,
        );
        const newLightness = THREE.MathUtils.lerp(
          currentColor.l,
          targetLightness,
          0.02,
        );

        material.color.setHSL(hue, newSaturation, newLightness);
      } else {
        // Get current color for smooth transitions
        const currentColor = material.color.getHSL({ h: 0, s: 0, l: 0 });

        // Smooth transition back to gray
        const newSaturation = THREE.MathUtils.lerp(currentColor.s, 0, 0.02); // Gray saturation = 0
        const newLightness = THREE.MathUtils.lerp(currentColor.l, 0.25, 0.02); // Gray lightness = 0.25

        material.color.setHSL(lastHue.current, newSaturation, newLightness);
      }
    }
  });

  return (
    <group position={position}>
      {/* Main rock body */}
      <RigidBody
        colliders={false}
        ref={rigidbodyRef}
        friction={0.6}
        restitution={0.2}
        density={0.15}
        linearDamping={0.1}
        angularDamping={0.3}
        type={isCurrentPlayer ? "dynamic" : "kinematicPosition"}
        userData={{ name: RigidBodyType.ROCK }}
      >
        <BallCollider sensor={!isCurrentPlayer} ref={colliderRef} args={[1]} />
        <mesh
          castShadow
          receiveShadow
          ref={meshRef}
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerMove={onPointerMove}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="gray" roughness={0.8} metalness={0} />
        </mesh>
      </RigidBody>

      <group ref={htmlGroupRef}>
        {children}

        <HeartParticles playerId={Number(playerId)} count={8} />

        <Html center distanceFactor={10} zIndexRange={[29, 0]}>
          <div
            ref={htmlContentRef}
            className="hud text-black bg-white px-1 py-0.5 rounded-lg whitespace-nowrap text-center text-sm"
          >
            <p className="font-bold">{rockName ?? "Rocky"}</p>
          </div>
        </Html>
      </group>
    </group>
  );
};
