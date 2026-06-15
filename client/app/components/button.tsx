import { type ReactNode, type TouchEvent, type MouseEvent } from "react";
import { cn } from "~/config/utils";
import { soundManager } from "~/services/sound-manager";
import { Sound } from "~/types";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  playSound?: boolean;
  onClick?: (e: MouseEvent) => void;
  onTouchStart?: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd?: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchCancel?: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchMove?: (e: TouchEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function Button({
  children,
  className = "",
  disabled = false,
  playSound = true,
  onClick,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  onTouchMove,
  onContextMenu,
}: ButtonProps) {
  const handleClick = (e: MouseEvent) => {
    if (disabled) return;
    if (playSound) soundManager.playSound(Sound.MENU_CLICK);
    onClick?.(e);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    onTouchStart?.(e);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    onTouchEnd?.(e);
  };

  const handleTouchCancel = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    onTouchCancel?.(e);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    onTouchMove?.(e);
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onContextMenu?.(e);
  };

  return (
    <div
      role="button"
      aria-disabled={disabled}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onTouchMove={handleTouchMove}
      onContextMenu={handleContextMenu}
      className={cn(
        "bg-[#FEC3A6] pointer-events-auto text-center border-4 border-[#FF928B] text-black rounded-lg p-4 px-6 transition-colors select-none",
        disabled
          ? "cursor-not-allowed opacity-50 bg-gray-300 border-gray-400"
          : "cursor-pointer hover:bg-[#FFD1B6]",
        className,
      )}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      {children}
    </div>
  );
}
