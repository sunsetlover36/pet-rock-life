import { type FC } from "react";
import { PlayerProfileJournal } from "./journal";
interface PlayerProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerProfileSheet: FC<PlayerProfileSheetProps> = ({
  isOpen,
  onClose,
}) => {
  return <PlayerProfileJournal isOpen={isOpen} onClose={onClose} />;
};
