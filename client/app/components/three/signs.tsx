import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useAtomValue } from "jotai";
import type { FC } from "react";
import { worldMetadataAtom } from "~/store";

interface SignProps {
  size?: [number, number, number];
  fontSize?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  text: string;
  color?: string;
  withStand?: boolean;
}
export const Sign: FC<SignProps> = (props) => {
  const {
    size = [0.3, 1.25, 3],
    fontSize = 0.35,
    position,
    rotation = [0, 0, 0],
    text,
    color = "#8A6552",
    withStand,
  } = props;

  return (
    <RigidBody
      type="fixed"
      colliders={withStand ? "cuboid" : false}
      position={position}
      rotation={rotation}
    >
      <group>
        {withStand && (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.3, 1.25, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
        )}

        <mesh castShadow receiveShadow position={[0, withStand ? 1.25 : 0, 0]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} />
        </mesh>

        <Text
          position={[-0.17, withStand ? 1.25 : 0, 0]} // Slightly in front of the sign
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={fontSize}
          color="#FFE0B5"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8} // Slightly smaller than sign width for padding
          textAlign="center"
          font="/fonts/Unkempt-Bold.ttf"
        >
          {text}
        </Text>
      </group>
    </RigidBody>
  );
};

export const Signs = () => {
  const worldMetadata = useAtomValue(worldMetadataAtom);

  if (!worldMetadata) return null;

  const { signs } = worldMetadata;
  return (
    <>
      {signs.map(({ id, ...sign }) => (
        <Sign key={id} {...sign} />
      ))}
    </>
  );
};
