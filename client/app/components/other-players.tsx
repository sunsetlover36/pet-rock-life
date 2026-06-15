import { useAtomValue } from "jotai";
import { otherPlayersAtom } from "~/store";
import { OtherPlayer } from "./three";
import { useMemo } from "react";

export const OtherPlayers = () => {
  const otherPlayersData = useAtomValue(otherPlayersAtom);

  const otherPlayers = useMemo(
    () =>
      Array.from(otherPlayersData.values()).map((player) => (
        <OtherPlayer key={player.id} player={player} />
      )),
    [otherPlayersData],
  );

  return otherPlayers;
};
