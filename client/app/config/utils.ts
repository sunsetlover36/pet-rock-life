import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dog, Seal, StumpChum, Warplet } from "~/components/three/models";
import {
  InteractionType,
  PassportRarity,
  PlayerSkin,
  type Player,
  type PlayerProfile,
} from "~/types";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const mapPlayerToProfile = (player: Player): PlayerProfile => {
  return {
    id: player.id,
    fid: player.fid,
    username: player.username,
    displayName: player.displayName,
    pfpUrl: player.pfpUrl,
    petRock: player.petRock,
    isConnected: player.isConnected,
    isInteracting: player.isInteracting,
    lastUpdate: player.lastUpdate,
    skin: player.skin,
    unlockedSkins: player.unlockedSkins,
    hat: player.hat,
    unlockedHats: player.unlockedHats,
    tag: player.tag,
    relationships: player.relationships,
  };
};

export const getSkinComponent = (skin?: PlayerSkin) => {
  let component = null;
  switch (skin) {
    case PlayerSkin.DOG:
      component = Dog;
      break;
    case PlayerSkin.STUMP_CHUM:
      component = StumpChum;
      break;
    case PlayerSkin.WARPLET:
      component = Warplet;
      break;
    default:
      component = Seal;
      break;
  }

  return component;
};

export const randint = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const formatCooldown = (ms: number): string => {
  const totalMinutes = Math.ceil(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes !== 1 ? "s" : ""}`;
  } else if (totalMinutes < 1440) {
    // < 24 hours
    return hours === 1 && minutes === 0
      ? "1 hour"
      : minutes > 0
        ? `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`
        : `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    const days = Math.floor(totalMinutes / 1440);
    return `${days} day${days !== 1 ? "s" : ""}`;
  }
};

export const formatAge = (ageInSeconds: number): string => {
  const days = Math.floor(ageInSeconds / 86400);
  const hours = Math.floor((ageInSeconds % 86400) / 3600);
  const minutes = Math.floor((ageInSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const getRockHappinessColor = (happiness: number): string => {
  if (happiness >= 80) return "bg-green-500";
  if (happiness >= 60) return "bg-yellow-500";
  if (happiness >= 40) return "bg-orange-500";
  return "bg-red-500";
};
export const getRockHappinessLabel = (happiness: number): string => {
  if (happiness >= 90) return "Gleaming";
  if (happiness >= 75) return "Warm";
  if (happiness >= 50) return "Okay";
  if (happiness >= 25) return "Sad";
  if (happiness >= 0) return "Crumbling";
  return "Okay";
};

export const getInteractionDuration = (
  interactionType: InteractionType,
): number => {
  switch (interactionType) {
    case InteractionType.RITUAL:
      return 10000;
    case InteractionType.MARRY:
      return 5000;
    case InteractionType.KISS:
    case InteractionType.HUG:
    case InteractionType.BACKFLIP:
      return 3000;
    default:
      return 2000;
  }
};

export const getRarityColor = (type: PassportRarity): string => {
  switch (type) {
    case PassportRarity.LEGENDARY:
      return "#DB222A"; // Red
    case PassportRarity.RARE:
      return "#541388"; // Indigo
    case PassportRarity.UNCOMMON:
      return "#8390FA"; // Vista Blue
    case PassportRarity.COMMON:
    default:
      return "#ACC196"; // Olivine
  }
};
