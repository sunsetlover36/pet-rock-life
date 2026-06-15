import { useAtomValue, useSetAtom } from "jotai";
import { uiModeAtom } from "~/store";
import { soundManager } from "~/services/sound-manager";
import { Sound, UIMode } from "~/types";
import { UI_IMAGES } from "~/config/images";
import { miniapp } from "~/services/miniapp";

export const PauseButton = () => {
  const setUiMode = useSetAtom(uiModeAtom);

  const handleClick = () => {
    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.haptic("light");
    setUiMode(UIMode.PAUSED);
  };

  return (
    <div
      className="bg-[#FEC3A6] h-[60px] border-4 border-[#FF928B] px-4 flex items-center justify-center rounded-2xl overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="select-none transition-colors active:bg-[#FF928B]/20"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <img src={UI_IMAGES.PAUSE} className="w-6" />
      </div>
    </div>
  );
};
