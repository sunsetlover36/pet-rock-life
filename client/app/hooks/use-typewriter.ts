import { useEffect, useState } from "react";
import { soundManager } from "~/services/sound-manager";
import { Sound } from "~/types";

interface TypewriterOptions {
  muted?: boolean;
  talkingSound?: Sound;
  soundFrequency?: number;
  skipToEnd?: boolean;
}

let timer: NodeJS.Timeout;
export const useTypewriter = (
  text: string,
  speed = 50,
  options?: TypewriterOptions,
) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const {
    muted = false,
    talkingSound = Sound.TALK,
    soundFrequency = 3,
    skipToEnd,
  } = options || {};

  useEffect(() => {
    if (skipToEnd) {
      setDisplayText(text);
      setIsComplete(true);
      clearInterval(timer);
      return;
    }

    setDisplayText("");
    setIsComplete(false);
    let index = 0;

    timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));

        // Play sound effect based on frequency
        if (!muted && index % soundFrequency === 0) {
          const char = text[index];
          // Only play sound for non-whitespace characters
          if (char && char.trim() !== "") {
            soundManager.playSound(talkingSound, 0.05);
          }
        }

        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, muted, talkingSound, soundFrequency, skipToEnd]);

  return { displayText, isComplete };
};
