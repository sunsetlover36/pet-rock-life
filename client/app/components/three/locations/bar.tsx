import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { FC } from "react";

import { BarExitZone } from "~/components/three";
import {
  BarWoodenFloor,
  BarCounter,
  Table,
  Chair,
  Barrel,
  Shield,
  Cake,
  Sword,
  Mug,
  Chicken,
} from "~/components/three/models";
import type { LocationProps } from "./types";

export const Bar: FC<LocationProps> = ({ position }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 0, 0]} scale={[2, 1, 2]}>
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, 12, 0]}
        scale={[2.2, 1, 2.2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <CuboidCollider args={[6, 1.5, 6]} />
        <BarWoodenFloor />
      </RigidBody>

      <RigidBody
        type="fixed"
        position={[0, 6, -16]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[2, 1, 2]}
      >
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[0, 6, 14]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[2, 1, 2]}
      >
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[-14, 6, 0]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={[2, 1, 2]}
      >
        <BarWoodenFloor />
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[17.5, 6, 0]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={[2, 1, 2]}
      >
        <BarWoodenFloor />
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders={false}
        position={[-10, 3.3, -8]}
        scale={1.5}
      >
        <CuboidCollider args={[1, 1, 2.5]} position={[-2, 0, 0]} />
        <CuboidCollider
          args={[1, 1, 2.5]}
          position={[0.4, 0, -2]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <BarCounter />
      </RigidBody>
      <Chicken
        scale={4}
        position={[-10, 5.4, -11]}
        rotation={[0, -Math.PI / 2 - 0.1, 0]}
      />

      <RigidBody type="fixed" position={[8, 2.5, 0]} scale={1.5}>
        <Table />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[6.8, 3, 3]}
        scale={1.5}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[9, 3, 3]}
        scale={1.5}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[6.8, 3, -3]}
        scale={1.5}
        rotation={[0, Math.PI, 0]}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[9, 3, -3]}
        scale={1.5}
        rotation={[0, Math.PI, 0]}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>

      <RigidBody type="fixed" position={[8, 2.5, -10]} scale={1.5}>
        <Table />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[6.8, 3, -7]}
        scale={1.5}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[9, 3, -7]}
        scale={1.5}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[6.8, 3, -13]}
        scale={1.5}
        rotation={[0, Math.PI, 0]}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[9, 3, -13]}
        scale={1.5}
        rotation={[0, Math.PI, 0]}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>

      <RigidBody type="fixed" position={[8, 2.5, 10]} scale={1.5}>
        <Table />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[6.8, 3, 13]}
        scale={1.5}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[9, 3, 13]}
        scale={1.5}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[6.8, 3, 7]}
        scale={1.5}
        rotation={[0, Math.PI, 0]}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[9, 3, 7]}
        scale={1.5}
        rotation={[0, Math.PI, 0]}
      >
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0, -0.3]} />
        <Chair />
      </RigidBody>

      <RigidBody colliders={false} type="fixed" position={[0, 3, 0]}>
        <CuboidCollider args={[1.5, 3, 1.5]} />
        <group>
          <Barrel position={[0, 0.25, 0]} scale={2.5} />
          <Cake position={[-0.1, 1.8, 0.1]} scale={6} />
        </group>
      </RigidBody>

      <group position={[-11.4, 3, -7]} scale={1.5}>
        <Shield />
        <Sword position={[0.1, 0.6, 0]} scale={1.2} />
      </group>

      <Mug position={[7.2, 4.6, -9.3]} scale={3} />
      <Mug position={[9.2, 4.6, -10.7]} scale={3} />

      <Mug position={[9.2, 4.6, 9.3]} scale={3} rotation={[0, 1.5, 0]} />
      <Mug position={[7.2, 4.6, 10.7]} scale={3} rotation={[0, 1, 0]} />

      <Mug position={[7.2, 5, 0]} scale={5} rotation={[0, 0.9, 0]} />

      <BarExitZone />
    </group>
  );
};
