import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  currentScreenAtom,
  currentPlayerAtom,
  uiModeAtom,
  newGraphicsSetAtom,
} from "~/store";
import { soundManager } from "~/services/sound-manager";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { Button } from "~/components/button";
import { cn } from "~/config/utils";
import { Screen, UIMode } from "~/types";
import { MyStyle } from "./my-style";
import { UI_IMAGES } from "~/config/images";
import { Settings } from "../settings";
import { SPLASHES } from "~/config/constants";
import { miniapp } from "~/services/miniapp";
import { isAnonymousPlayer } from "~/config/player";

interface MenuUIProps {
  onPlay: () => void;
}

const SpinningRock = () => {
  const rockRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!rockRef.current) return;

    rockRef.current.rotation.y += delta / 10;
    rockRef.current.rotation.z += delta / 10;
  });

  return (
    <mesh ref={rockRef}>
      <dodecahedronGeometry args={[2, 0]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

export const MenuUI = ({ onPlay }: MenuUIProps) => {
  const [isPlayAnimating, setIsPlayAnimating] = useState(false);
  const [isMiniAppAdded, setMiniAppAdded] = useState<boolean>(false);

  const uiMode = useAtomValue(uiModeAtom);
  const [currentScreen, setCurrentScreen] = useAtom(currentScreenAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const setIsNewGraphicsSet = useSetAtom(newGraphicsSetAtom);
  const isGuest = isAnonymousPlayer(currentPlayer);
  const canAddMiniApp = !isGuest && !isMiniAppAdded;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    miniapp.haptic("heavy");
    setIsPlayAnimating(true);

    setTimeout(() => {
      setIsPlayAnimating(false);
      onPlay();
    }, 500);
  };
  const handlePressKey = () => {
    setCurrentScreen(Screen.MAIN_MENU);
    soundManager.initializeOnUserGesture();
    soundManager.startBackgroundMusic();
  };
  const handleAddMiniApp = async () => {
    try {
      const result = await miniapp.addMiniApp();
      if (result && result.notificationDetails) {
        setMiniAppAdded(true);
      }
    } catch {}
  };

  const randomSplash = useMemo(
    () => SPLASHES[Math.floor(Math.random() * SPLASHES.length)],
    [],
  );
  const isRainbowText = useMemo(() => Math.random() < 0.175, []);
  const isMenuFlipped = useMemo(() => Math.random() < 0.005, []);
  const isChangedText = useMemo(() => Math.random() < 0.0075, []);

  const menuButtonClassName =
    "bg-[#FF928B] text-xl py-1 mb-2 last:mb-0 border-gray-700 [@media(max-height:600px)]:text-base";

  const tapAnywhereComponent = useMemo(
    () => (
      <div
        className="text-center flex flex-col items-center justify-center text-2xl w-full h-full"
        onClick={handlePressKey}
      >
        <img
          src={UI_IMAGES.FORWARD}
          className="w-16 h-16 mb-1 animate-scale-pulse"
        />
        <p className="text-white">tap anywhere!</p>
        <p className="text-gray-200 text-xs">(to enable sound)</p>
      </div>
    ),
    [],
  );
  const mainMenuComponent = useMemo(
    () => (
      <div className="w-full">
        <div className="mb-6 [@media(max-height:600px)]:mb-4">
          <Canvas
            gl={{
              antialias: false,
            }}
            id="main-menu-canvas"
            camera={{ position: [0, 0, 5], fov: 50 }}
          >
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <SpinningRock />
          </Canvas>
          <div className="relative text-center w-fit mx-auto">
            <h2
              className={cn(
                "text-5xl font-bold mb-2 text-white [@media(max-height:600px)]:text-3xl [@media(max-height:600px)]:mb-0",
                isRainbowText && "rainbow-text",
              )}
            >
              pet rock life
            </h2>
            <p
              className="text-sm text-amber-200 font-bold animate-scale-pulse tracking-tighter [@media(max-height:600px)]:text-[10px]"
              style={{
                fontFamily: "Source Code Pro",
              }}
            >
              {randomSplash}
            </p>
          </div>
        </div>
        <div>
          <Button className={menuButtonClassName} onClick={handleSubmit}>
            {isChangedText ? "rock" : "Play"}
          </Button>
          <Button
            className={menuButtonClassName}
            onClick={() => {
              setCurrentScreen(Screen.MY_STYLE);
            }}
          >
            {isChangedText ? "rock" : "My Style"}
          </Button>
          <Button
            className={menuButtonClassName}
            onClick={() => {
              setCurrentScreen(Screen.SETTINGS);
            }}
          >
            {isChangedText ? "rock" : "Settings"}
          </Button>
          {canAddMiniApp && (
            <Button className={menuButtonClassName} onClick={handleAddMiniApp}>
              {isChangedText ? "rock" : "Add Mini App"}
            </Button>
          )}
          <Button
            className={menuButtonClassName}
            onClick={() => {
              setCurrentScreen(Screen.CREDITS);
            }}
          >
            {isChangedText ? "rock" : "Credits"}
          </Button>
          <Button
            className={menuButtonClassName}
            onClick={() => {
              miniapp.close();
            }}
          >
            {isChangedText ? "rock" : "Exit"}
          </Button>
        </div>
        <div className="mt-8 [@media(max-height:600px)]:mt-4">
          <img
            src={UI_IMAGES.DOG}
            className="w-20 h-20 rounded-lg mx-auto mt-2"
          />
        </div>
      </div>
    ),
    [isRainbowText, isMenuFlipped, isChangedText, canAddMiniApp],
  );

  const settingsComponent = useMemo(
    () => (
      <>
        <div className="bg-[#FEC3A6] rounded-xl p-6">
          <Settings />
        </div>
        <Button
          className={cn(menuButtonClassName, "mt-4")}
          onClick={() => {
            setCurrentScreen(Screen.MAIN_MENU);
            setIsNewGraphicsSet(false);
          }}
        >
          Back
        </Button>
      </>
    ),
    [],
  );

  const creditsComponent = useMemo(
    () => (
      <div className="w-full">
        <div className="bg-[#FF928B] text-black rounded-lg p-4 text-center">
          <div className="mb-4">
            <h3 className="text-2xl">Music</h3>
            <div>
              <a
                href="https://pizzadoggy.itch.io/cozy-tunes"
                className="text-black hover:text-gray-700 underline"
                rel="noopener noreferrer"
              >
                Cozy Tunes
              </a>{" "}
              by{" "}
              <a
                href="https://pizzadoggy.itch.io/"
                className="text-black hover:text-gray-700 underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Pizzadoggy
              </a>
              <p className="text-sm">(Inspired by Minecraft)</p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl">Images</h3>
            <div>
              <a
                href="https://leo-red.itch.io/lucid-icon-pack"
                className="text-black hover:text-gray-700 underline"
                rel="noopener noreferrer"
              >
                Lucid Icons
              </a>{" "}
              by{" "}
              <a
                href="https://leo-red.itch.io"
                className="text-black hover:text-gray-700 underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Leo Red
              </a>
            </div>
          </div>
        </div>
        <Button
          className={cn(menuButtonClassName, "mt-4")}
          onClick={() => {
            setCurrentScreen(Screen.MAIN_MENU);
          }}
        >
          Back
        </Button>
      </div>
    ),
    [],
  );

  useEffect(() => {
    (async () => {
      const context = await miniapp.context();
      setMiniAppAdded(Boolean(context?.client?.added));
    })();
  }, []);

  if (!currentPlayer || uiMode !== UIMode.MAIN_MENU) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center z-50 transition-all duration-700 ease-out",
        currentScreen !== Screen.MY_STYLE && "bg-black/20",
        isPlayAnimating && "scale-110 opacity-0",
      )}
    >
      <div
        className={cn(
          "h-full rounded-2xl w-full max-w-[380px] p-8 flex justify-center items-center",
          isMenuFlipped &&
            currentScreen !== Screen.TAP_ANYWHERE &&
            "rotate-180",
          currentScreen === Screen.MY_STYLE && "items-end",
        )}
      >
        <div
          className={cn(
            "w-full h-full",
            currentScreen === Screen.TAP_ANYWHERE ? "block" : "hidden",
          )}
        >
          {tapAnywhereComponent}
        </div>
        <div
          className={cn(
            "w-full",
            currentScreen === Screen.MAIN_MENU ? "block" : "hidden",
          )}
        >
          {mainMenuComponent}
        </div>
        <div
          className={cn(
            "w-full",
            currentScreen === Screen.MY_STYLE ? "block" : "hidden",
          )}
        >
          <MyStyle player={currentPlayer} />
        </div>
        <div
          className={cn(
            "w-full",
            currentScreen === Screen.SETTINGS ? "block" : "hidden",
          )}
        >
          {settingsComponent}
        </div>
        <div
          className={cn(
            "w-full",
            currentScreen === Screen.CREDITS ? "block" : "hidden",
          )}
        >
          {creditsComponent}
        </div>
      </div>
    </div>
  );
};
