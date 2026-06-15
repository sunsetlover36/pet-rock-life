import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import type { Route } from "./+types/experience";
import { Provider, useAtom, useAtomValue, useSetAtom } from "jotai";
import { miniapp } from "~/services/miniapp";
import * as THREE from "three";

import { Controls, GraphicsMode, UIMode } from "~/types";
import { MenuUI, CinematicUI, GameplayUI } from "~/components";
import { TextModal } from "~/components/text-modal";
import { WebSocketManager } from "~/services/socket";
import {
  currentPlayerAtom,
  clientStore,
  previewSkinAtom,
  previewHatAtom,
  wsManagerAtom,
  interactionsDataAtom,
  worldMetadataAtom,
  uiModeAtom,
  antialiasingAtom,
} from "~/store";
import { SheetsManager } from "~/services/sheets-manager";
import {
  createPreviewPlayer,
  getInteractionsData,
  getWorldMetadata,
} from "~/services/game-data";
import { EventAlertsManager } from "~/components/event-alerts-manager";
import { useKeyboardManager } from "~/hooks/use-keyboard-manager";
import { KeyboardControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LoaderProvider, LoadingScreen } from "~/services/loader-service";
import { captureException } from "@sentry/react";
import { IS_DEV } from "~/config/constants";
import { soundManager } from "~/services/sound-manager";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pet Rock Life" },
    {
      name: "description",
      content: "Walk around with your pet rock and chat with others!",
    },
  ];
}

const keyboardMap = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.backward, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.jump, keys: ["Space"] },
  { name: Controls.run, keys: ["Shift"] },
  { name: Controls.petRock, keys: ["KeyE"] },
  { name: Controls.rockMenu, keys: ["KeyR"] },
];
const Game = lazy(() =>
  import("~/components/game").then((module) => ({ default: module.Game })),
);
const GameContent = () => {
  const graphicsMode = localStorage.getItem("graphics-quality") as GraphicsMode;

  const [wsManager, setWsManager] = useAtom(wsManagerAtom);
  const antialiasingEnabled = useAtomValue(antialiasingAtom); // FIXME: no atom? no dynamic on/off to prevent re-render?

  const setUiMode = useSetAtom(uiModeAtom);
  const setCurrentPlayer = useSetAtom(currentPlayerAtom);
  const setPreviewSkin = useSetAtom(previewSkinAtom);
  const setPreviewHat = useSetAtom(previewHatAtom);
  const setInteractionsData = useSetAtom(interactionsDataAtom);
  const setWorldMetadata = useSetAtom(worldMetadataAtom);

  const initAuth = async () => {
    try {
      const userData = createPreviewPlayer();
      if (userData) {
        setCurrentPlayer(userData);
        setPreviewHat(userData.hat);
        setPreviewSkin(userData.skin);
      }

      setInteractionsData(await getInteractionsData());
      setWorldMetadata(await getWorldMetadata());
    } catch (error) {
      captureException(error, {
        extra: {
          step: "auth initialize",
        },
      });
      console.error("Failed to authenticate:", error);
    }
  };
  useEffect(() => {
    const isMobileDevice = (): boolean => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

      return (
        mobileRegex.test(userAgent) ||
        ("ontouchstart" in window && navigator.maxTouchPoints > 0)
      );
    };

    const resumeSound = () => {
      if (!document.hidden && isMobileDevice()) {
        soundManager.startBackgroundMusic();
      }
    };
    document.addEventListener("visibilitychange", resumeSound);

    initAuth();

    if (localStorage.getItem("graphics-quality") === null) {
      localStorage.setItem("graphics-quality", "low");
    }

    return () => {
      document.removeEventListener("visibilitychange", resumeSound);
    };
  }, []);
  useEffect(() => {
    return () => {
      wsManager?.disconnect();
    };
  }, [wsManager]);

  const handlePressPlay = async () => {
    setUiMode(UIMode.GAMEPLAY);

    // Create WebSocket manager and connect
    const manager = new WebSocketManager(clientStore);
    setWsManager(manager);

    try {
      await manager.connect();
    } catch (error) {
      console.error("Failed to connect to game server:", error);
      setUiMode(UIMode.MAIN_MENU);
    }
  };

  useKeyboardManager();

  return (
    <>
      <div>
        <MenuUI onPlay={handlePressPlay} />
        <CinematicUI />

        <TextModal />
        <SheetsManager />
        <EventAlertsManager />
      </div>

      <LoadingScreen />

      <div
        id="canvas-container"
        className="w-full h-screen fixed top-0 left-0 select-none"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <GameplayUI />

        <KeyboardControls map={keyboardMap}>
          <Canvas
            id="main-canvas"
            shadows={graphicsMode === GraphicsMode.HIGH}
            camera={{
              position: [0, 20, 0],
              rotation: [0, 0.3, 0],
              fov: 70,
              near: 1,
              far: 250,
            }}
            gl={{
              powerPreference: "default",
              toneMapping: THREE.ACESFilmicToneMapping,
              antialias: antialiasingEnabled,
            }}
          >
            {/*{IS_DEV && <Stats />}*/}
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          </Canvas>
        </KeyboardControls>
      </div>
    </>
  );
};

const Experience = () => {
  useLayoutEffect(() => {
    miniapp.ready({ disableNativeGestures: true });
  }, []);

  return (
    <Provider store={clientStore}>
      <LoaderProvider>
        <GameContent />
      </LoaderProvider>
    </Provider>
  );
};

export default Experience;
