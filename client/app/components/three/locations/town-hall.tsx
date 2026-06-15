import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useRef, type FC } from "react";

import {
  BarWoodenFloor,
  Table,
  Kitty,
  Scroll,
} from "~/components/three/models";
import type { LocationProps } from "./types";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { Image } from "@react-three/drei";

interface PaintingProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  imgUrl: string;
  zoom?: number;
  size?: number;
}
const Painting: FC<PaintingProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  imgUrl,
  zoom = 1,
  size = 4,
}) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.1, size, size]} />
        <meshBasicMaterial color="#8A6552" />
      </mesh>

      <Image
        url={imgUrl}
        zoom={zoom}
        scale={size / 1.125}
        position={[-0.07, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
    </group>
  );
};

export const TownHall: FC<LocationProps> = ({ position }) => {
  const kittyRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!kittyRef.current) return;

    const breatheScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02; // ±5% scale change
    kittyRef.current.scale.setScalar(2 * breatheScale);
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 0, 0]} scale={[1.5, 1, 1.5]}>
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, 9, 0]}
        scale={[1.65, 1, 1.65]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <CuboidCollider args={[6, 1.5, 6]} />
        <BarWoodenFloor />
      </RigidBody>

      <RigidBody
        type="fixed"
        position={[0, 4.5, -12.5]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.5, 1, 1.5]}
      >
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[0, 4.5, 10]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.5, 1, 1.5]}
      >
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[-10, 4.5, 0]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={[1.5, 1, 1.5]}
      >
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[13.125, 4.5, 0.5]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={[1.45, 1, 1.5]}
      >
        <BarWoodenFloor />
      </RigidBody>

      <group position={[7, 1.75, 7]} rotation={[0, 0.4, 0]}>
        <RigidBody type="fixed" position={[0, 0, 0]} rotation={[0, -2.5, 0]}>
          <Kitty ref={kittyRef} scale={2} />
        </RigidBody>
        <RigidBody
          type="fixed"
          position={[-2, 0.25, -2.75]}
          rotation={[0, -2.5, 0]}
        >
          <Table scale={[1.25, 2, 1]} />
          <Scroll scale={3} position={[0, 2.15, -0.7]} rotation={[1.5, 0, 0]} />
        </RigidBody>
      </group>

      <Painting
        position={[7, 6, 11.55]}
        rotation={[0, -Math.PI / 2, 0]}
        imgUrl="/paintings/1.png"
        size={5}
      />
      <Painting
        position={[0, 6, 11.55]}
        rotation={[0, -Math.PI / 2, 0]}
        imgUrl="/paintings/4.png"
        size={5}
      />
      <Painting
        position={[-7, 6, 11.55]}
        rotation={[0, -Math.PI / 2, 0]}
        imgUrl="/paintings/5.png"
        size={5}
      />
      <Painting
        position={[-8, 6, -10.65]}
        rotation={[0, Math.PI / 2, 0]}
        imgUrl="/paintings/6.png"
        size={4}
      />
      <Painting
        position={[-3, 6, -10.65]}
        rotation={[0, Math.PI / 2, 0]}
        imgUrl="/paintings/7.png"
        size={4}
      />
      <Painting
        position={[2, 6, -10.65]}
        rotation={[0, Math.PI / 2, 0]}
        imgUrl="/paintings/8.png"
        size={4}
      />
      <Painting
        position={[7, 6, -10.65]}
        rotation={[0, Math.PI / 2, 0]}
        imgUrl="/paintings/9.png"
        size={4}
      />
      <Painting position={[11.33, 6, 7]} imgUrl="/paintings/2.png" size={5} />
      <Painting position={[11.33, 6, 0]} imgUrl="/icon.png" size={4} />
      <Painting
        position={[11.33, 6, -6.5]}
        imgUrl="/paintings/3.png"
        size={5}
        zoom={0.93}
      />

      <Painting
        position={[-11, 6, 0]}
        rotation={[0, Math.PI, 0]}
        imgUrl="/paintings/10.png"
        size={6}
      />
      <Painting
        position={[-11, 6, -6.5]}
        rotation={[0, Math.PI, 0]}
        imgUrl="/paintings/11.png"
        size={5}
      />

      <mesh position={[-11.6, 4.5, 8]}>
        <boxGeometry args={[0.4, 6, 4]} />
        <meshBasicMaterial color="#361a17" />
      </mesh>
    </group>
  );
};
