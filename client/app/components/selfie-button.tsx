import { UI_IMAGES } from "~/config/images";
import { Button } from "./button";
import { useAtomValue, useSetAtom } from "jotai";
import { composerAtom, selfieUrlAtom } from "~/store";
import html2canvas from "html2canvas-pro";
import { soundManager } from "~/services/sound-manager";
import { Sound } from "~/types";
import { useState } from "react";

export const SelfieButton = () => {
  const composer = useAtomValue(composerAtom);
  const setSelfieUrl = useSetAtom(selfieUrlAtom);

  const takePhoto = async () => {
    if (!composer) return;

    try {
      const dpr = 2;

      const webglCanvas = composer.getRenderer().domElement;
      const hudElements = document.querySelectorAll(".hud");
      if (hudElements.length === 0) {
        composer.render();
        return webglCanvas.toDataURL("image/jpeg", 0.85);
      }

      const hudContainer = document.createElement("div");
      hudContainer.style.position = "fixed";
      hudContainer.style.top = "0";
      hudContainer.style.left = "0";
      hudContainer.style.width = `${webglCanvas.width}px`;
      hudContainer.style.height = `${webglCanvas.height}px`;
      hudContainer.style.pointerEvents = "none";
      hudContainer.style.zIndex = "-10";

      hudElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const clone = element.cloneNode(true) as HTMLElement;

        clone.style.position = "absolute";
        clone.style.top = `${rect.top * dpr}px`;
        clone.style.left = `${rect.left * dpr}px`;
        clone.style.width = `${rect.width * dpr}px`;
        clone.style.height = `${rect.height * dpr}px`;

        hudContainer.appendChild(clone);
      });

      document.body.appendChild(hudContainer);

      const hudCanvas = await html2canvas(hudContainer, {
        backgroundColor: null,
        useCORS: true,
        scale: dpr,
        logging: false,
      });

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = webglCanvas.width;
      finalCanvas.height = webglCanvas.height;

      const ctx = finalCanvas.getContext("2d")!;

      composer.render();

      // Draw WebGL background
      ctx.drawImage(webglCanvas, 0, 0);
      // Draw HUD overlay
      ctx.drawImage(hudCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

      document.body.removeChild(hudContainer);

      soundManager.playSound(Sound.CAMERA_SHUTTER, 0.5);
      setSelfieUrl(finalCanvas.toDataURL("image/jpeg"));
    } catch (error) {
      console.error("Screenshot failed:", error);
      return null;
    }
  };

  return (
    <Button
      playSound={false}
      className="px-4 h-[60px] flex items-center justify-center rounded-2xl"
      onClick={takePhoto}
    >
      <img src={UI_IMAGES.DISK} className="w-6 rotate-90" />
    </Button>
  );
};
