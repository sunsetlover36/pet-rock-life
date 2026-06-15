import { Edges } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import type { FC } from "react";
import { Heart, Kitty, Table, Scroll } from "~/components/three/models";
import type { LocationProps } from "./types";

export const KittyHollow: FC<LocationProps> = ({ position }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[20, 2, 20]} />
          <meshBasicMaterial color="#FFA552" />
          <Edges lineWidth={10} scale={1.005} color="black" />
        </mesh>
      </RigidBody>

      {/* Invisible walls */}
      <RigidBody type="fixed" position={[10, 5, 0]}>
        <mesh>
          <boxGeometry args={[1, 10, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-10, 5, 0]}>
        <mesh>
          <boxGeometry args={[1, 10, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 5, 10]}>
        <mesh>
          <boxGeometry args={[20, 10, 1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 5, -10]}>
        <mesh>
          <boxGeometry args={[20, 10, 1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" position={[0, 1, 7.5]}>
        <Heart scale={20} />
      </RigidBody>
      <RigidBody type="fixed" position={[5, 1, 4]} rotation={[0, -2.5, 0]}>
        <Kitty scale={2} />
        <Scroll scale={3} position={[0, 2, 2]} rotation={[1, 0, 0]} />
      </RigidBody>
      <RigidBody type="fixed" position={[3, 1, 1.25]} rotation={[0, -2.5, 0]}>
        <Table scale={[1.25, 2, 1]} />
      </RigidBody>
    </group>
  );
};
