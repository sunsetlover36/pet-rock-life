import { useMemo, type FC } from "react";
import { Button } from "./button";
import { useAtomValue } from "jotai";
import { currentPlayerAtom } from "~/store";

interface SelfieSheetProps {
  selfieUrl: string | null;
  onClose: () => void;
}

const PEN_COLORS = [
  "#4C6BFF", // bright blue
  "#FF66CC", // pink
  "#2ECC71", // emerald green
  "#333333", // dark gray
  "#000000", // black
];
const SIGNS = [
  "rockstar!",
  "new drip",
  "stone cold selfie",
  "boulder & prouder",
  "caught vibing",
  "proof of rock",
  "geo-metry check",
  "feeling igneous",
  "say cheese!",
  "sedimental moment",
  "pet me pls",
  "rocking the village",
  "gravelicious",
  "just rolled in",
  "main character",
  `step on me (i'm sorry)`,
  "daddy",
  "terminally online",
  "slay!!!",
  "hot singles in your area",
];
export const SelfieSheet: FC<SelfieSheetProps> = ({ selfieUrl, onClose }) => {
  const player = useAtomValue(currentPlayerAtom);

  const {
    textTilt,
    photoTilt,
    xOffset,
    yOffset,
    fontSize,
    textX,
    textY,
    text,
    color,
  } = useMemo(() => {
    const params = {
      textTilt: Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1),
      photoTilt: Math.random() * 16 - 8,
      xOffset: Math.random() * 40 - 20,
      yOffset: Math.random() * 30 - 15,
      textX: 40 + Math.random() * 40,
      textY: Math.max(10, Math.random() * 40),
      text: SIGNS[Math.floor(Math.random() * SIGNS.length)],
      color: PEN_COLORS[Math.floor(Math.random() * PEN_COLORS.length)],
      fontSize: 24 + Math.random() * 8,
    };
    if (params.text.length > 18) {
      params.fontSize = 24;
    }

    return params;
  }, [selfieUrl]);

  if (!selfieUrl || !player) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div className="w-full h-full relative flex flex-col px-4 items-center justify-center">
        <div
          className="photo bg-white rounded-lg p-6 max-w-[380px] w-full animate-stamp relative"
          style={{
            transform: `rotate(${photoTilt}deg) translate(${xOffset}px, ${yOffset}px)`,
            transformOrigin: "center center",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="w-full h-full max-h-[60vh] overflow-hidden mx-auto mb-14 shadow-inner rounded-sm drop-shadow-sm">
            <img
              src={selfieUrl}
              alt="Selfie"
              className="w-full h-full object-fit rounded-sm contrast-110"
            />
          </div>
          <div className="w-full absolute left-0 bottom-6">
            <p
              className="text-2xl font-bold relative"
              style={{
                transform: `rotate(${textTilt}deg)`,
                fontSize: `${fontSize}px`,
                left: `${textX}px`,
                bottom: `${textY}px`,
                fontFamily: "Comic Sans MS, Chalkboard SE, sans-serif",
                color,
              }}
            >
              {text}
            </p>
          </div>
        </div>

        <div className="w-full max-w-[380px] flex justify-between items-center gap-x-8 mt-4 px-0 animate-fade-in">
          <Button className="text-xl font-bold w-full" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
