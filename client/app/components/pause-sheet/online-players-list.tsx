import { type FC } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  allPlayersAtom,
  currentPlayerAtom,
  otherPlayersAtom,
  playerProfileSheetAtom,
  selectedPlayerProfileAtom,
} from "~/store";
import { soundManager } from "~/services/sound-manager";
import { Sound, type PlayerProfile } from "~/types";
import { PlayerAvatar } from "~/config/player";

interface OnlinePlayersListProps {
  onPlayerClick: (player: PlayerProfile) => void;
}

export const OnlinePlayersList: FC<OnlinePlayersListProps> = ({
  onPlayerClick,
}) => {
  // FIXME: Wtf is all players atom? chaos in players
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const allPlayers = useAtomValue(allPlayersAtom);
  const otherPlayers = useAtomValue(otherPlayersAtom);
  const playersList = Array.from(allPlayers.values());

  if (!currentPlayer) {
    return;
  }

  const handlePlayerClick = (player: PlayerProfile) => {
    soundManager.playSound(Sound.MENU_CLICK);
    onPlayerClick(player);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="text-xl font-bold text-black flex justify-center items-center gap-x-2 mb-2">
        <div className="w-2 h-2 bg-green-400 rounded-full border-2 border-green-600"></div>
        <p>
          {playersList.length}{" "}
          {playersList.length > 1 ? "villagers" : "villager"}
        </p>
      </div>

      {/* Players List */}
      <div className="max-h-[40vh] overflow-y-scroll flex justify-center items-center flex-wrap">
        {playersList.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No villagers online</p>
        ) : (
          playersList.map((player) => (
            <div
              key={player.id}
              className="rounded-full w-14 h-14 p-0.5 cursor-pointer active:scale-95 hover:scale-110 transition-all"
              onClick={() =>
                handlePlayerClick(
                  player.id === currentPlayer.id
                    ? player
                    : otherPlayers.get(player.id)!,
                )
              }
            >
              <PlayerAvatar
                player={player}
                className="w-full h-full rounded-full border-2 border-[#FF928B] overflow-hidden"
              />
              {/*<div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-black flex items-center gap-x-1 mb-0.5">
                    {player.tag && (
                      <span
                        className="text-xs font-bold rounded px-1 flex-shrink-0 border-2"
                        style={{
                          backgroundColor: player.tag.color,
                          color: "#000",
                        }}
                      >
                        {player.tag.text}
                      </span>
                    )}
                    <span className="truncate">
                      {player.displayName || player.username}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 truncate">
                    {player.petRock.name}
                  </div>
                </div>*/}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
