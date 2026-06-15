import { RigidBody, CuboidCollider } from "@react-three/rapier";

import { useFrame } from "@react-three/fiber";
import { currentScreenAtom, isConnectedAtom, clientStore } from "~/store";
import { InteractionManager } from "~/services/interaction-manager";
import { Screen } from "~/types";
import { Locations } from "./locations";
import { useLocationObserver } from "~/services/location-observer";
import { Pickups } from "./pickups";
import { Signs } from "./signs";
import { ScenarioManager } from "~/services/scenario-manager";
import { useRef } from "react";

const WORLD_SIZE = 800;
const HALF_WORLD_SIZE = WORLD_SIZE / 2;

export const World = () => {
  const isCameraPosResetted = useRef(false);
  useLocationObserver();
  useFrame(({ camera }, delta) => {
    const isConnected = clientStore.get(isConnectedAtom);
    const currentScreen = clientStore.get(currentScreenAtom);
    if (!isConnected && currentScreen !== Screen.MY_STYLE) {
      if (!isCameraPosResetted.current) {
        isCameraPosResetted.current = true;
        camera.position.set(0, 20, 0);
        camera.rotation.set(0, 0.3, 0);
      }
      camera.rotation.y += delta * 0.07;
    } else if (isCameraPosResetted.current) {
      isCameraPosResetted.current = false;
    }
  });

  return (
    <>
      {/* Ground */}
      <RigidBody type="fixed" position={[0, -1.8, 0]} rotation={[0, 0, 0]}>
        <CuboidCollider
          args={[HALF_WORLD_SIZE, 0.6, HALF_WORLD_SIZE]}
          position={[0, 1, 0]}
        />
      </RigidBody>
      {/* --- --- --- */}

      {/* Boundary walls */}
      <RigidBody type="fixed" position={[0, 0, 61]} rotation={[0, -0.45, 0]}>
        <CuboidCollider args={[75, 25, 2]} />
      </RigidBody>
      <RigidBody type="fixed" position={[-40, 0, 0]} rotation={[0, 1.25, 0]}>
        <CuboidCollider args={[75, 25, 2]} />
      </RigidBody>
      <RigidBody type="fixed" position={[37, 0, 0]} rotation={[0, -1, 0]}>
        <CuboidCollider args={[100, 25, 2]} />
      </RigidBody>
      <RigidBody type="fixed" position={[46, 0, 50]} rotation={[0, 0.9, 0]}>
        <CuboidCollider args={[50, 25, 2]} />
      </RigidBody>
      {/* --- --- --- */}

      <Locations />
      <Pickups />
      <Signs />

      <InteractionManager />
      <ScenarioManager />
    </>
  );
};
