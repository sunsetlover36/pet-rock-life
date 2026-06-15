import { type FC, useEffect, useState } from "react";
import { type EventAlert as EventAlertType, EventType } from "~/types";
import { cn } from "~/config/utils";

interface EventAlertProps {
  alert: EventAlertType;
  onRemove: (id: string) => void;
}

export const EventAlert: FC<EventAlertProps> = ({ alert, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Start exit animation before removal
    const exitTimer = setTimeout(
      () => {
        setIsExiting(true);
        // Remove after exit animation completes
        setTimeout(() => onRemove(alert.id), 300);
      },
      (alert.duration || 3000) - 300,
    );

    return () => clearTimeout(exitTimer);
  }, [alert.duration, alert.id, onRemove]);

  return (
    <div
      className={cn(
        "text-center transform transition-all duration-300 ease-out",
        isVisible && !isExiting
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-[20px] opacity-0 scale-95",
        isExiting && "translate-y-[10px] opacity-0",
      )}
    >
      <div className="flex-1 text-black bg-[#FF928B] rounded-full px-3 py-1 w-fit mx-auto">
        {alert.message}
      </div>
    </div>
  );
};
