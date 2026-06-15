import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useAtomValue } from "jotai";
import { isConnectedAtom } from "~/store";

export const GreatVillageRock = () => {
  const isConnected = useAtomValue(isConnectedAtom);

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[-4, 0.1, -40]}
      rotation={[-0.004, -0.097, -0.001]}
      scale={2}
    >
      <CuboidCollider args={[2.1, 5.7, 1.3]} position={[-0.1, 0, -0.4]} />

      {isConnected && (
        <Html
          as="div"
          center
          distanceFactor={16}
          className="text-2xl w-80 text-black bg-[#FEC3A6] py-1 px-2 rounded-lg text-center"
          zIndexRange={[28, 0]}
          position={[0, 3.75, -0.5]}
        >
          The Great Village Inscription
        </Html>
      )}
    </RigidBody>
  );
};
