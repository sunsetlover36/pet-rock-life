import { type FC, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  pendingInteractionAtom,
  interactionTimeoutAtom,
  wsManagerAtom,
  addEventAlertAtom,
} from "~/store";
import { InteractionType, Sound } from "~/types";
import { soundManager } from "~/services/sound-manager";

interface InteractionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const getInteractionLabel = (type: string): string => {
  switch (type) {
    case InteractionType.WAVE:
      return "Wave";
    case InteractionType.HUG:
      return "Hug";
    case InteractionType.ADMIRE_ROCK:
      return "Admire Rock";
    case InteractionType.FRIEND_REQUEST:
      return "Friend Request";
    case InteractionType.BACKFLIP:
      return "Backflip";
    case InteractionType.RITUAL:
      return "Ritual";
    case InteractionType.KISS:
      return "Kiss";
    case InteractionType.MARRY:
      return "Marry";
    default:
      return type;
  }
};

const getInteractionEmoji = (type: string): string => {
  switch (type) {
    case InteractionType.WAVE:
      return "👋";
    case InteractionType.HUG:
      return "🤗";
    case InteractionType.ADMIRE_ROCK:
      return "🪨";
    case InteractionType.FRIEND_REQUEST:
      return "👥";
    case InteractionType.BACKFLIP:
      return "🤸";
    case InteractionType.RITUAL:
      return "🔮";
    case InteractionType.KISS:
      return "💋";
    case InteractionType.MARRY:
      return "💍";
    default:
      return "🤝";
  }
};

export const InteractionSheet: FC<InteractionSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const pendingInteraction = useAtomValue(pendingInteractionAtom);
  const timeout = useAtomValue(interactionTimeoutAtom);
  const wsManager = useAtomValue(wsManagerAtom);
  const setTimeout = useSetAtom(interactionTimeoutAtom);
  const setPendingInteraction = useSetAtom(pendingInteractionAtom);
  const addEventAlert = useSetAtom(addEventAlertAtom);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Handle countdown and auto-close
  useEffect(() => {
    if (isOpen && pendingInteraction) {
      // Play sound when dialog appears
      soundManager.playSound(Sound.TWINKLE_1);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeout((current) => {
          if (current <= 1) {
            // Auto-reject when timeout reaches 0
            if (wsManager && pendingInteraction) {
              wsManager.rejectInteraction(pendingInteraction.interactionId);
            }
            return 30;
          }
          return current - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [isOpen, pendingInteraction, wsManager, setTimeout]);

  const handleAccept = () => {
    if (pendingInteraction && wsManager) {
      soundManager.playSound(Sound.MENU_CLICK);
      wsManager.acceptInteraction(pendingInteraction.interactionId);
    }
  };

  const handleReject = () => {
    if (pendingInteraction && wsManager) {
      soundManager.playSound(Sound.MENU_CLICK);
      wsManager.rejectInteraction(pendingInteraction.interactionId);
    }
  };

  const handleClose = () => {
    if (pendingInteraction && wsManager) {
      wsManager.rejectInteraction(pendingInteraction.interactionId);
    } else {
      onClose();
      setPendingInteraction(null);
    }
  };

  if (!isOpen || !pendingInteraction) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-[#FF928B]/20 p-6 max-w-[380px] w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-[#2F2F2F] mb-2">
            Interaction Request
          </h3>
          <div className="text-gray-600">
            <span className="font-bold">
              {pendingInteraction.sourceUsername}
            </span>
            <span> wants to </span>
            <span className="font-bold text-[#FF928B]">
              {getInteractionLabel(pendingInteraction.type)}
            </span>
          </div>
        </div>

        {/* Timeout indicator */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Auto-decline in {timeout} seconds
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#FF928B] h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeout / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:scale-95 transition-all duration-200"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-3 bg-[#FF928B] text-white rounded-lg font-medium hover:bg-[#FF8D85] active:scale-95 transition-all duration-200"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
