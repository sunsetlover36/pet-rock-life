import { useAtom } from "jotai";
import { useState, type FC } from "react";
import { cn } from "~/config/utils";
import { soundManager } from "~/services/sound-manager";
import { antialiasingAtom, newGraphicsSetAtom, pixelModeAtom } from "~/store";
import { GraphicsMode, Sound } from "~/types";
import { Button } from "./button";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const Checkbox: FC<CheckboxProps> = ({ checked, onChange, label }) => {
  return (
    <div
      className="flex items-center justify-between py-2 cursor-pointer transition-colors"
      onClick={() => {
        soundManager.playSound(Sound.MENU_CLICK);
        onChange(!checked);
      }}
    >
      <span className="text-black font-bold text-lg">{label}</span>
      <div
        className={cn(
          "w-6 h-6 rounded border-2 border-[#FF928B] transition-all",
          checked ? "bg-[#FF928B]" : "bg-[#F8F3DD]",
        )}
      >
        {checked && (
          <svg
            className="w-full h-full p-0.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}

const Select: FC<SelectProps> = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-2 select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-black font-bold text-lg">{label}</span>
      </div>
      <div className="relative">
        <div
          className="bg-[#F8F3DD] border-2 border-[#FF928B] px-3 py-1.5 cursor-pointer hover:bg-[#F0EAD1] transition-colors rounded-lg"
          onClick={() => {
            soundManager.playSound(Sound.MENU_CLICK);
            setIsOpen(!isOpen);
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-black">
              {options.find((opt) => opt.value === value)?.label || value}
            </span>
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-180",
              )}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="#FF928B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#F8F3DD] rounded-lg border-2 border-[#FF928B] overflow-hidden z-10">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "px-3 py-1.5 cursor-pointer transition-colors",
                  value === option.value
                    ? "bg-[#FF928B]"
                    : "hover:bg-[#F0EAD1]",
                )}
                onClick={() => {
                  soundManager.playSound(Sound.MENU_CLICK);
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="text-black">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const Settings: FC = () => {
  const [antialiasing, setAntialiasing] = useAtom(antialiasingAtom);
  const [pixelMode, setPixelMode] = useAtom(pixelModeAtom);

  const [isNewGraphicsSet, setIsNewGraphicsSet] = useAtom(newGraphicsSetAtom);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("sound-enabled");
    return saved !== null ? saved === "true" : true;
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem("music-enabled");
    return saved !== null ? saved === "true" : true;
  });
  const [graphicsQuality, setGraphicsQuality] = useState(() => {
    return localStorage.getItem("graphics-quality") || "medium";
  });

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("sound-enabled", String(enabled));
    soundManager.setEnabled(enabled, enabled ? Sound.MENU_CLICK : undefined);
  };
  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    localStorage.setItem("music-enabled", String(enabled));
    soundManager.setMusicEnabled(enabled);
  };
  const handleGraphicsChange = (quality: string) => {
    setGraphicsQuality(quality);
    localStorage.setItem("graphics-quality", quality);
    if (quality !== graphicsQuality) {
      setIsNewGraphicsSet(true);
    }
  };
  const handleAntialiasingToggle = (enabled: boolean) => {
    setAntialiasing(enabled);
  };
  const handlePixelModeToggle = (enabled: boolean) => {
    setPixelMode(enabled);
  };

  const graphicsOptions = [
    { value: GraphicsMode.LOW, label: "Low" },
    { value: GraphicsMode.MEDIUM, label: "Medium" },
    { value: GraphicsMode.HIGH, label: "High" },
  ];

  return (
    <div className="w-full max-w-md select-none">
      <div className="space-y-2">
        <Checkbox
          checked={soundEnabled}
          onChange={handleSoundToggle}
          label="Sound Effects"
        />

        <Checkbox
          checked={musicEnabled}
          onChange={handleMusicToggle}
          label="Music"
        />

        <div>
          <Select
            value={graphicsQuality}
            onChange={handleGraphicsChange}
            options={graphicsOptions}
            label="Graphics Quality"
          />
          {isNewGraphicsSet && (
            <div>
              <p className="text-black text-sm -mt-1 mb-2">
                Refresh the game to apply graphics settings
              </p>
              <Button
                className="py-1 bg-[#FF928B] hover:bg-[#FF8D85]"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Refresh
              </Button>
            </div>
          )}
        </div>

        <Checkbox
          checked={antialiasing}
          onChange={handleAntialiasingToggle}
          label="Antialiasing"
        />

        <Checkbox
          checked={pixelMode}
          onChange={handlePixelModeToggle}
          label="Pixel Mode"
        />
      </div>
    </div>
  );
};
