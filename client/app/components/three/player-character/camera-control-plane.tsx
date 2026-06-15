import { type FC, type RefObject } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { Mesh } from "three";

interface CameraControlPlaneProps {
  ref: RefObject<Mesh | null>;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave: (e: ThreeEvent<PointerEvent>) => void;
}
export const CameraControlPlane: FC<CameraControlPlaneProps> = (props) => {
  return (
    <mesh {...props}>
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};
