import { useAtom, useAtomValue } from "jotai";
import { PlayerProfileSheet } from "~/components/player-profile-sheet";
import { InteractionSheet } from "~/components/interaction-sheet";
import {
  playerProfileSheetAtom,
  interactionDialogVisibleAtom,
  uiModeAtom,
  selfieUrlAtom,
} from "~/store";
import { PauseSheet } from "~/components/pause-sheet";
import { UIMode } from "~/types";
import { SelfieSheet } from "~/components/selfie-sheet";

export const SheetsManager = () => {
  const uiMode = useAtomValue(uiModeAtom);
  const [isPlayerProfileSheetOpen, setIsPlayerProfileSheetOpen] = useAtom(
    playerProfileSheetAtom,
  );
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useAtom(
    interactionDialogVisibleAtom,
  );
  const [selfieUrl, setSelfieUrl] = useAtom(selfieUrlAtom);

  return (
    <>
      <PlayerProfileSheet
        isOpen={isPlayerProfileSheetOpen}
        onClose={() => setIsPlayerProfileSheetOpen(false)}
      />
      <InteractionSheet
        isOpen={isInteractionDialogOpen}
        onClose={() => setIsInteractionDialogOpen(false)}
      />
      <PauseSheet isOpen={uiMode === UIMode.PAUSED} />
      <SelfieSheet selfieUrl={selfieUrl} onClose={() => setSelfieUrl(null)} />
    </>
  );
};
