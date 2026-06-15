import { useAtom, useSetAtom } from "jotai";
import { useState, type FC } from "react";
import { HAT_CONFIGS } from "~/config/hats";
import { SKIN_CONFIGS } from "~/config/skins";
import { cn } from "~/config/utils";
import {
  currentPlayerAtom,
  currentScreenAtom,
  previewHatAtom,
  previewSkinAtom,
  wsManagerAtom,
} from "~/store";
import { PlayerHat, PlayerSkin, Screen, type PlayerProfile } from "~/types";
import { Button } from "../button";
import {
  savePendingPlayerStyle,
  savePlayerStyle,
} from "~/services/player-style";

interface MyStyleProps {
  player: PlayerProfile;
}
export const MyStyle: FC<MyStyleProps> = ({ player }) => {
  const [isSkinChooseOpen, setIsSkinChooseOpen] = useState(false);
  const [isHatChooseOpen, setIsHatChooseOpen] = useState(false);

  const [previewSkin, setPreviewSkin] = useAtom(previewSkinAtom);
  const [previewHat, setPreviewHat] = useAtom(previewHatAtom);

  const setCurrentScreen = useSetAtom(currentScreenAtom);
  const setPlayer = useSetAtom(currentPlayerAtom);
  const [wsManager] = useAtom(wsManagerAtom);

  const skins = Object.values(SKIN_CONFIGS);
  const hats = Object.values(HAT_CONFIGS);

  const isHatChanged = previewHat !== player.hat;
  const isSkinChanged = previewSkin !== player.skin;
  const isStyleChanged = isHatChanged || isSkinChanged;

  const isLockedHat = !player.unlockedHats.includes(previewHat);
  const isLockedSkin = !player.unlockedSkins.includes(previewSkin);
  const isApplyDisabled = isLockedHat || isLockedSkin;

  const isPreviewingPaperbag =
    previewHat === PlayerHat.PAPERBAG_HAT && isLockedHat;

  const handleBack = () => {
    setPreviewSkin(player.skin);
    setPreviewHat(player.hat);

    if (isSkinChooseOpen || isHatChooseOpen) {
      setIsSkinChooseOpen(false);
      setIsHatChooseOpen(false);
    } else {
      setCurrentScreen(Screen.MAIN_MENU);
    }
  };
  const handleApply = () => {
    if (isApplyDisabled) return;

    const style = {
      hat: previewHat,
      skin: previewSkin,
    };

    savePlayerStyle(style);

    if (wsManager?.isConnected()) {
      wsManager.changeStyle(style);
    } else {
      savePendingPlayerStyle(style);
    }

    setPlayer((player) => ({
      ...player!,
      hat: style.hat,
      skin: style.skin,
    }));
  };
  const buttonClassName =
    "bg-[#FF928B] text-xl py-2 w-full last:mb-0 border-gray-700 [@media(max-height:600px)]:text-base";
  return (
    <div className="w-full">
      {!isSkinChooseOpen && !isHatChooseOpen && (
        <div className="grid grid-cols-2 space-x-4">
          <div
            className="mt-2 bg-[#FF928B] rounded-lg p-4 text-center text-black cursor-pointer hover:bg-[#FFD1B6] transition-colors"
            onClick={() => setIsSkinChooseOpen(true)}
          >
            <p className="text-sm">My skin</p>
            <h3 className="text-xl">
              {SKIN_CONFIGS[player.skin ?? PlayerSkin.SEAL].name}
            </h3>
            <p className="text-xs mt-1 text-gray-700">Tap to change</p>
          </div>
          <div
            className="mt-2 bg-[#FF928B] rounded-lg p-4 text-center text-black cursor-pointer hover:bg-[#FFD1B6] transition-colors"
            onClick={() => setIsHatChooseOpen(true)}
          >
            <p className="text-sm">My hat</p>
            <h3 className="text-xl">
              {HAT_CONFIGS[player.hat ?? PlayerHat.NONE].name}
            </h3>
            <p className="text-xs mt-1 text-gray-700">Tap to change</p>
          </div>
        </div>
      )}
      {isSkinChooseOpen && (
        <div className="w-full flex gap-x-4 bg-white/80 p-2 rounded-lg overflow-x-auto">
          {skins.map((skin) => (
            <div
              key={skin.id}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg border-4 transition-all duration-200 cursor-pointer",
                skin.id === previewSkin
                  ? "border-[#FF928B] bg-[#FEC3A6]"
                  : "border-gray-200 bg-white hover:border-[#FFD1B6]",
              )}
              onClick={() => {
                setPreviewSkin(skin.id);
              }}
            >
              <img
                src={skin.previewImage}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
      {isHatChooseOpen && (
        <div className="w-full flex gap-x-4 bg-white/80 p-2 rounded-lg overflow-x-auto">
          {hats.map((hat) =>
            hat.hidden ? null : (
              <div
                key={hat.id}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-lg border-4 transition-all duration-200 cursor-pointer",
                  hat.id === previewHat
                    ? "border-[#FF928B] bg-[#FEC3A6]"
                    : "border-gray-200 bg-white hover:border-[#FFD1B6]",
                )}
                onClick={() => {
                  setPreviewHat(hat.id);
                }}
              >
                <img
                  src={hat.previewImage}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            ),
          )}
        </div>
      )}

      <div className="flex gap-x-4 items-center mt-4">
        <Button className={buttonClassName} onClick={handleBack}>
          Back
        </Button>
        {isStyleChanged && !isPreviewingPaperbag && (
          <Button
            className={buttonClassName}
            disabled={isApplyDisabled}
            onClick={handleApply}
          >
            {isApplyDisabled ? "Locked" : "Apply"}
          </Button>
        )}
        {isPreviewingPaperbag && (
          <Button className={buttonClassName} disabled>
            Locked
          </Button>
        )}
      </div>
    </div>
  );
};
