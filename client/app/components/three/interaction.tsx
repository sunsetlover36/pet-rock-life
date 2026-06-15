import { Html } from "@react-three/drei";
import { Pointer } from "lucide-react";
import { cn } from "~/config/utils";
import { soundManager } from "~/services/sound-manager";
import { type InteractionData, Sound } from "~/types";

export const Interaction = (props: InteractionData) => {
  const { position, content, className, isVisible, onInteract } = props;

  const handleInteraction = () => {
    soundManager.playSound(Sound.MENU_CLICK);
    onInteract?.();
  };

  return (
    <Html
      as="div"
      position={position}
      center
      distanceFactor={12}
      zIndexRange={[31, 0]}
      className={cn("relative z-100", className)}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <div
        className="bg-black/80 hover:bg-black/90 transition-colors p-4 px-6 min-w-36 rounded-3xl text-white flex justify-center items-center gap-x-4 text-2xl cursor-pointer"
        onClick={handleInteraction}
      >
        <div className="bg-gray-700/80 rounded-full flex items-center justify-center w-12 h-12">
          <Pointer />
        </div>
        <div>{content ?? "Interact"}</div>
      </div>
    </Html>
  );
};
