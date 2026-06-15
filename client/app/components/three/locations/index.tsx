import { useAtomValue } from "jotai";
import { Bar as BarLocation } from "./bar";
import { KittyHollow } from "./kitty-hollow";
import { worldMetadataAtom } from "~/store";
import { Village } from "./village";
import { Area, Interior } from "~/types";
import { TownHall as TownHallLocation } from "./town-hall";

export const Locations = () => {
  const worldMetadata = useAtomValue(worldMetadataAtom);

  if (!worldMetadata) {
    return null;
  }

  const { areas, interiors } = worldMetadata;
  return (
    <>
      {/* Areas */}
      <Village position={areas[Area.VILLAGE].position} />
      <KittyHollow position={areas[Area.KITTY_HOLLOW].position} />

      {/* Interiors */}
      <BarLocation position={interiors[Interior.BAR].position} />
      <TownHallLocation position={interiors[Interior.TOWN_HALL].position} />
    </>
  );
};
