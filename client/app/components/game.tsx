import * as THREE from "three";
import { Sky, useKTX2 } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { GraphicsMode } from "~/types";
import { useAtomValue, useSetAtom } from "jotai";
import {
  composerAtom,
  currentPlayerAtom,
  isConnectedAtom,
  pixelModeAtom,
} from "~/store";
import { useEffect, useRef } from "react";
import { CurrentPlayer, MyStyleCharacter, World } from "./three";
import { Physics } from "@react-three/rapier";
import { OtherPlayers } from "./other-players";
import {
  EffectComposer,
  Pixelation,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";

const Skybox = () => {
  const scene = useThree((state) => state.scene);
  const envMap = useKTX2("/skybox/sunset/skybox.ktx2");

  useEffect(() => {
    if (envMap) {
      envMap.mapping = THREE.CubeReflectionMapping;
      envMap.colorSpace = THREE.SRGBColorSpace;

      scene.environment = envMap;
      scene.background = envMap;
    }

    return () => {
      scene.environment = null;
      scene.background = null;
    };
  }, [envMap, scene]);

  return null;
};

const ConnectedPlayers = () => {
  const isConnected = useAtomValue(isConnectedAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);

  if (!isConnected || !currentPlayer) {
    return null;
  }

  return (
    <>
      <CurrentPlayer player={currentPlayer} />
      <OtherPlayers />
    </>
  );
};
const Postprocessing = () => {
  const ref = useRef(null);
  const setComposer = useSetAtom(composerAtom);

  const graphicsMode = localStorage.getItem("graphics-quality") as GraphicsMode;
  const pixelModeEnabled = useAtomValue(pixelModeAtom);

  useEffect(() => {
    if (ref.current) {
      setComposer(ref.current);
    }
  }, [ref.current, setComposer]);
  return (
    <EffectComposer
      ref={ref}
      multisampling={0}
      enableNormalPass={graphicsMode === GraphicsMode.HIGH}
    >
      <>
        <SMAA />
        {pixelModeEnabled && <Pixelation granularity={6} />}
        {graphicsMode === GraphicsMode.HIGH && (
          <Vignette offset={0.3} darkness={0.6} />
        )}
      </>
    </EffectComposer>
  );
};
const GraphicsSettings = () => {
  const graphicsMode = localStorage.getItem("graphics-quality") as GraphicsMode;

  return (
    <>
      <Sky
        distance={500}
        sunPosition={[5, 10, 0]}
        inclination={0}
        azimuth={0.25}
      />
      <ambientLight intensity={1} />

      {(!graphicsMode || graphicsMode === GraphicsMode.LOW) && (
        <>
          <fog attach="fog" args={["#87CEEB", 50, 300]} />
          <directionalLight intensity={2} position={[40, 150, 40]} />
        </>
      )}

      {graphicsMode === GraphicsMode.MEDIUM && (
        <>
          <fog attach="fog" args={["#B5D6E8", 20, 200]} />
          <directionalLight
            intensity={1.5}
            position={[40, 150, 40]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-camera-near={0.5}
            shadow-camera-far={500}
          />
        </>
      )}

      {graphicsMode === GraphicsMode.HIGH && (
        <>
          <directionalLight
            intensity={1.5}
            position={[40, 150, 40]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-camera-near={0.5}
            shadow-camera-far={500}
          />
          <fog attach="fog" args={["#563874", 20, 200]} />
        </>
      )}
    </>
  );
};

export const Game = () => {
  return (
    <>
      <MyStyleCharacter />
      <Physics gravity={[0, -9.81, 0]}>
        <World />
        <ConnectedPlayers />
      </Physics>

      <Postprocessing />
      <GraphicsSettings />
    </>
  );
};
