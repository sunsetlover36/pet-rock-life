import { type FC, useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  selectedPlayerProfileAtom,
  currentPlayerAtom,
  interactionsDataAtom,
} from "~/store";
import { soundManager } from "~/services/sound-manager";
import { ProfilePage } from "./profile-page";
import { InteractionsPage } from "./interactions-page";
import { RockPassportPage } from "./rock-passport-page";
import { RockDiaryPage } from "./rock-diary-page";
import { JournalMenuPage } from "./journal-menu-page";
import { Sound } from "~/types";
import { miniapp } from "~/services/miniapp";
import { getInteractionsData } from "~/services/game-data";

interface PlayerProfileJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

type JournalView = "menu" | "profile" | "interactions" | "passport" | "diary";

export const PlayerProfileJournal: FC<PlayerProfileJournalProps> = ({
  isOpen,
  onClose,
}) => {
  const selectedPlayer = useAtomValue(selectedPlayerProfileAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const [interactionsData, setInteractionsData] = useAtom(interactionsDataAtom);
  const [currentView, setCurrentView] = useState<JournalView>("menu");

  useEffect(() => {
    if (isOpen) {
      (async () => {
        setInteractionsData(await getInteractionsData());
      })();
    }
  }, [isOpen]);

  if (!isOpen || !selectedPlayer || !currentPlayer) return null;

  const isOwnProfile = currentPlayer?.fid === selectedPlayer.fid;

  const handleClose = () => {
    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.haptic("light");

    setCurrentView("menu");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleViewChange = (view: JournalView) => {
    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.haptic("light");
    setCurrentView(view);
  };

  const handleBackToMenu = () => {
    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.haptic("light");
    setCurrentView("menu");
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative bg-[#F5F5DC] w-full h-full sm:h-auto sm:max-h-[92dvh] sm:max-w-[420px] sm:rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#8B4513]/20">
          {currentView !== "menu" && (
            <button
              onClick={handleBackToMenu}
              className="bg-[#FF928B] text-black hover:bg-[#FFD1B6] px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back
            </button>
          )}

          <div />

          <button
            onClick={handleClose}
            className="bg-[#FF928B] hover:bg-[#FF8D85] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {currentView === "menu" && (
            <JournalMenuPage
              player={selectedPlayer}
              isOwnProfile={isOwnProfile}
              onNavigate={handleViewChange}
            />
          )}
          {currentView === "profile" && (
            <ProfilePage
              player={selectedPlayer}
              currentPlayer={currentPlayer}
              relationshipLevels={interactionsData.relationshipLevels}
            />
          )}
          {currentView === "interactions" &&
            !isOwnProfile &&
            selectedPlayer.isConnected && (
              <InteractionsPage
                targetPlayer={selectedPlayer}
                currentPlayer={currentPlayer}
                onInteract={() => {
                  setCurrentView("menu");
                }}
              />
            )}
          {currentView === "passport" && (
            <RockPassportPage
              currentPlayer={currentPlayer}
              selectedPlayer={selectedPlayer}
            />
          )}
          {currentView === "diary" && (
            <RockDiaryPage
              rock={selectedPlayer.petRock}
              isOwnProfile={isOwnProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
};
