import { useState, useRef, useEffect, type FC } from "react";
import {
  type PlayerProfile,
  type InteractionAction,
  InteractionType,
  RelationshipType,
  EventType,
} from "~/types";
import { soundManager } from "~/services/sound-manager";
import { useAtomValue, useSetAtom } from "jotai";
import {
  addEventAlertAtom,
  interactionsDataAtom,
  playerProfileSheetAtom,
  useGameStore,
  wsManagerAtom,
} from "~/store";
import { Vector3 } from "three";
import { formatCooldown } from "~/config/utils";
import { Sound } from "~/types";
import { miniapp } from "~/services/miniapp";
import { getInteractionLabel } from "~/config/interaction";
import { isAnonymousPlayer } from "~/config/player";

interface InteractionsPageProps {
  targetPlayer: PlayerProfile;
  currentPlayer: PlayerProfile;
  onInteract: () => void;
}

export const InteractionsPage: FC<InteractionsPageProps> = ({
  targetPlayer,
  currentPlayer,
  onInteract,
}) => {
  const { interactions: interactionsList, cooldowns } =
    useAtomValue(interactionsDataAtom);
  const setIsPlayerProfileSheetOpen = useSetAtom(playerProfileSheetAtom);
  const wsManager = useAtomValue(wsManagerAtom);
  const addEventAlert = useSetAtom(addEventAlertAtom);

  const [warnings, setWarnings] = useState<
    Map<
      InteractionType,
      {
        text: string;
        phase: "hidden" | "appearing" | "floating";
        timestamp: number;
      }
    >
  >(new Map());

  const timeoutRefs = useRef<Map<InteractionType, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const relationship = currentPlayer.relationships[targetPlayer.fid];
  const hasGuest =
    isAnonymousPlayer(currentPlayer) || isAnonymousPlayer(targetPlayer);

  const showWarning = (actionId: InteractionType, text: string) => {
    // Clear any existing timeout for this action
    const existingTimeout = timeoutRefs.current.get(actionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set warning to appearing phase
    setWarnings((prev) => {
      const newWarnings = new Map(prev);
      newWarnings.set(actionId, {
        text,
        phase: "appearing",
        timestamp: Date.now(),
      });
      return newWarnings;
    });

    // After appear animation (0.2s), start floating
    setTimeout(() => {
      setWarnings((prev) => {
        const newWarnings = new Map(prev);
        const warning = newWarnings.get(actionId);
        if (warning) {
          newWarnings.set(actionId, {
            ...warning,
            phase: "floating",
          });
        }
        return newWarnings;
      });
    }, 200);

    // After float animation (2s), hide warning
    const hideTimeout = setTimeout(() => {
      setWarnings((prev) => {
        const newWarnings = new Map(prev);
        newWarnings.delete(actionId);
        return newWarnings;
      });
      timeoutRefs.current.delete(actionId);
    }, 2200); // 200ms appear + 2000ms float

    timeoutRefs.current.set(actionId, hideTimeout);
  };

  const handleInteraction = async (action: InteractionAction) => {
    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.haptic("light");
    addEventAlert({
      type: EventType.INTERACTION_REQUEST_SENT,
      message: `${getInteractionLabel(action.id)} request sent`,
    });

    const gameState = useGameStore.getState();
    const sourcePlayerState = gameState.getPlayerState(
      currentPlayer.fid.toString(),
    );
    const targetPlayerState = gameState.getPlayerState(
      targetPlayer.fid.toString(),
    );
    if (!sourcePlayerState || !targetPlayerState) return;

    if (currentPlayer.isInteracting || targetPlayer.isInteracting) {
      showWarning(action.id, "Player is busy");
      return;
    }

    const sourcePlayerPosition = new Vector3(
      sourcePlayerState.position.x,
      sourcePlayerState.position.y,
      sourcePlayerState.position.z,
    );
    const targetPlayerPosition = new Vector3(
      targetPlayerState.position.x,
      targetPlayerState.position.y,
      targetPlayerState.position.z,
    );

    if (
      sourcePlayerPosition.distanceTo(targetPlayerPosition) >
      action.distanceRequired
    ) {
      showWarning(action.id, "Player is too far");
      return;
    }

    onInteract();
    wsManager?.startInteraction({
      sourceFid: currentPlayer.fid,
      targetFid: targetPlayer.fid,
      type: action.id,
    });
    setIsPlayerProfileSheetOpen(false);
  };

  const isActionAvailable = (action: InteractionAction): boolean => {
    if (action.disabled) {
      return false;
    }
    if ((relationship?.points ?? 0) < action.pointsRequired) {
      return false;
    }

    const cooldown = cooldowns.find(
      (interaction) => interaction.interactionType === action.id,
    );
    if (cooldown) {
      const cooldownHours = action.cooldownHours ?? 0;
      const hasCooldown =
        Date.now() - new Date(cooldown.lastUsed).getTime() <
        cooldownHours * 60 * 60 * 1000;

      if (hasCooldown) {
        return false;
      }
    }

    return true;
  };

  const getActionStatus = (action: InteractionAction): string => {
    if (
      (relationship?.points ?? 0) < action.pointsRequired &&
      action.pointsRequired > 0
    ) {
      return `Requires ${action.pointsRequired.toLocaleString("en-US")} relationship points`;
    }

    const cooldown = cooldowns.find(
      (interaction) => interaction.interactionType === action.id,
    );
    if (cooldown) {
      const cooldownHours = action.cooldownHours ?? 0;
      const cooldownMs = cooldownHours * 60 * 60 * 1000;

      const now = Date.now();
      const lastUsed = new Date(cooldown.lastUsed).getTime();
      if (cooldownMs > now - lastUsed) {
        return `Cooldown: ${formatCooldown(cooldownMs - (now - lastUsed))}`;
      }
    }

    return "";
  };

  return (
    <div className="space-y-6 p-4">
      {/* Available Interactions */}
      <div className="space-y-3">
        {interactionsList
          .filter((action) => {
            if (hasGuest && action.id === InteractionType.FRIEND_REQUEST) {
              return false;
            }

            const isMarriedOrFriend = [
              RelationshipType.FRIEND,
              RelationshipType.MARRIED,
            ].includes(relationship?.relationshipType);
            if (
              action.id === InteractionType.FRIEND_REQUEST &&
              isMarriedOrFriend
            ) {
              return false;
            } else if (
              action.id === InteractionType.MARRY &&
              relationship?.relationshipType === RelationshipType.MARRIED
            ) {
              return false;
            }

            return true;
          })
          .map((action) => {
            const isAvailable = isActionAvailable(action);
            const warning = warnings.get(action.id);
            const status = getActionStatus(action);

            return (
              <div
                key={action.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isAvailable
                    ? "bg-white/50 border-[#FF928B]/20 hover:border-[#FF928B]/40"
                    : "bg-gray-100/50 border-gray-300/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-[#2F2F2F]">
                      {action.label}
                    </h5>
                    {action.disabled ? (
                      <p className="text-xs text-gray-600">Coming soon</p>
                    ) : (
                      <>
                        {status && (
                          <p className="text-xs text-red-600">{status}</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <div
                      className={`absolute -top-4 z-10 -left-1/2 bg-red-400 rounded-lg px-2 py-1 text-sm text-black w-max pointer-events-none transition-all duration-100 ${
                        !warning
                          ? "warning-hidden"
                          : warning.phase === "appearing"
                            ? "warning-appear"
                            : warning.phase === "floating"
                              ? "warning-float"
                              : "warning-hidden"
                      }`}
                    >
                      {warning?.text}
                    </div>

                    <button
                      onClick={() => handleInteraction(action)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isAvailable
                          ? "bg-[#FF928B] text-white hover:bg-[#B8541A] active:scale-95"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
