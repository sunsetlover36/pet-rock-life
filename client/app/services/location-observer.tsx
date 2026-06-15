import { useEffect, useRef } from "react";
import { TeleportationManager } from "./teleportation-manager";
import {
  Area,
  Interior,
  type PlayerLocation,
  type WorldMetadata,
} from "~/types";
import { useAtomValue } from "jotai";
import { locationAtom, worldMetadataAtom } from "~/store";

const getDestination = (
  prevLocation: PlayerLocation,
  newLocation: PlayerLocation,
  worldMetadata: WorldMetadata,
) => {
  const { area: prevArea, interior: prevInterior } = prevLocation;
  const { area: newArea, interior: newInterior } = newLocation;

  if (prevArea !== newArea) {
    if (newArea === Area.VILLAGE) {
      return worldMetadata.areas[Area.VILLAGE].spawnPosition;
    } else if (newArea === Area.KITTY_HOLLOW) {
      return worldMetadata.areas[Area.KITTY_HOLLOW].spawnPosition;
    }

    return null;
  } else if (prevInterior !== newInterior) {
    if (prevInterior === null && newInterior === Interior.BAR) {
      return worldMetadata.interiors[Interior.BAR].exitPosition;
    } else if (prevInterior === null && newInterior === Interior.TOWN_HALL) {
      return worldMetadata.interiors[Interior.TOWN_HALL].exitPosition;
    } else if (prevInterior === Interior.BAR && newInterior === null) {
      return worldMetadata.interiors[Interior.BAR].entrancePosition;
    } else if (prevInterior === Interior.TOWN_HALL && newInterior === null) {
      return worldMetadata.interiors[Interior.TOWN_HALL].entrancePosition;
    }

    return null;
  }

  return null;
};

export const useLocationObserver = () => {
  const location = useAtomValue(locationAtom);
  const worldMetadata = useAtomValue(worldMetadataAtom);
  const prevLocationRef = useRef<PlayerLocation>(location);

  useEffect(() => {
    if (!worldMetadata) return;

    const destination = getDestination(
      prevLocationRef.current,
      location,
      worldMetadata,
    );

    if (destination) {
      TeleportationManager.teleportPlayer(destination);
      prevLocationRef.current = location;
    }
  }, [location, worldMetadata]);
};
