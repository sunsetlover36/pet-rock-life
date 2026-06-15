import { UI_IMAGES } from "~/config/images";
import { Chat } from "./chat";
import { PauseButton } from "./pause-button";
import { Button } from "./button";
import { Joystick } from "./joystick";
import { useAtomValue, useSetAtom } from "jotai";
import {
  uiModeAtom,
  uiComponentsAtom,
  jumpTriggerAtom,
  wsManagerAtom,
  devModeAtom,
  clientStore,
  currentPlayerAtom,
  useGameStore,
} from "~/store";
import { UIComponent, UIMode } from "~/types";
import { useEffect, useRef } from "react";
import { cn } from "~/config/utils";
import { VERSION_LABEL } from "~/config/constants";
import { SelfieButton } from "./selfie-button";

const DevPanel = () => {
  const devMode = useAtomValue(devModeAtom);
  const positionSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      if (!positionSpanRef.current) return;

      animationId = requestAnimationFrame(animate);

      const currentPlayer = clientStore.get(currentPlayerAtom);
      if (!currentPlayer) return;

      const gameState = useGameStore.getState();
      const playerState = gameState.getPlayerState(
        currentPlayer.fid.toString(),
      );
      if (!playerState) return;

      const position = playerState.position;
      positionSpanRef.current.textContent = `x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}, z: ${position.z.toFixed(2)}`;
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      className={cn(
        "absolute top-24 left-8 font-mono select-none z-50",
        devMode ? "block" : "hidden",
      )}
    >
      <div className="text-[10px]">
        <p>
          player pos [<span ref={positionSpanRef}></span>]
        </p>
      </div>
    </div>
  );
};

export const GameplayUI = () => {
  const uiMode = useAtomValue(uiModeAtom);
  const uiComponents = useAtomValue(uiComponentsAtom);

  const wsManager = useAtomValue(wsManagerAtom);
  const setJumpTrigger = useSetAtom(jumpTriggerAtom);

  const handleJump = () => {
    setJumpTrigger(true);
    setTimeout(() => setJumpTrigger(false), 100);
  };

  const isChatVisible = uiComponents[UIComponent.CHAT];
  const isPauseButtonVisible = uiComponents[UIComponent.PAUSE_BUTTON];
  const isJoystickVisible = uiComponents[UIComponent.JOYSTICK];

  return (
    <div
      className={cn(
        "absolute z-40 w-full h-full pointer-events-none",
        uiMode !== UIMode.GAMEPLAY && "hidden",
      )}
    >
      <DevPanel />

      <div className="absolute top-0.5 right-0.5 text-[10px] font-mono select-none opacity-50">
        {VERSION_LABEL}
      </div>
      <div className="absolute w-full top-8 px-8 left-0 flex justify-between items-start">
        <div>
          <div className="pointer-events-auto">
            {isChatVisible && <Chat wsManager={wsManager} />}
          </div>
          <div className="pointer-events-auto mt-4">
            <SelfieButton />
          </div>
        </div>
        <div className="pointer-events-auto">
          {isPauseButtonVisible && <PauseButton />}
        </div>
      </div>

      <div className="absolute w-full bottom-8 px-8 left-0 flex justify-between items-center">
        <div className="flex gap-4">
          <Button
            className="p-4"
            onClick={() => {
              if (!("ontouchstart" in window)) {
                handleJump();
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleJump();
            }}
          >
            <img src={UI_IMAGES.ARROW_UP} className="w-12 h-12" />
          </Button>
        </div>
        <div className="pointer-events-auto">
          {isJoystickVisible && <Joystick />}
        </div>
      </div>
    </div>
  );
};
