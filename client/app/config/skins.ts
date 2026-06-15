import { PlayerSkin, type PlayerSkinSettings } from "~/types";

export enum SkinAvailability {
  FREE = "free",
  UNLOCKABLE = "unlockable",
  DEV_ONLY = "dev_only",
}

export interface SkinConfig {
  id: PlayerSkin;
  name: string;
  description: string;
  availability: SkinAvailability;
  unlockRequirement?: string;
  previewImage?: string;
  modelComponent: string; // Component name for rendering
  // Preview positions for different contexts
  selectionPreview: {
    position: [number, number, number];
    scale: [number, number, number];
    rotation?: [number, number, number];
  };
  stylePreview: {
    position: [number, number, number];
    scale: [number, number, number];
    rotation?: [number, number, number];
  };
  // In-game physics and positioning
  gameSettings: PlayerSkinSettings;
  hudSettings: {
    chatPosition: [number, number, number];
    namePosition: [number, number, number];
  };
}

export const SKIN_CONFIGS: Record<PlayerSkin, SkinConfig> = {
  [PlayerSkin.SEAL]: {
    id: PlayerSkin.SEAL,
    name: "Seal",
    description: "The classic companion for your rock adventures",
    availability: SkinAvailability.FREE,
    previewImage: "/skins/preview_seal.png",
    modelComponent: "Seal",
    selectionPreview: {
      position: [0, -0.5, 0],
      scale: [0.7, 0.7, 0.7],
      rotation: [0, 0, 0],
    },
    stylePreview: {
      position: [0, 0.75, 0],
      scale: [0.9, 0.9, 0.9],
      rotation: [0, 0, 0],
    },
    gameSettings: {
      position: { x: 0, y: -0.77, z: 0 },
      translationOffset: { x: -0.4, y: 0, z: 0 },
      colliderParams: [0.5, 0.65, 0.5],
      ropeJoint: 2,
      hatColliderOffset: 0.15,
    },
    hudSettings: {
      chatPosition: [0, 2, 0],
      namePosition: [0, 0.9, 0],
    },
  },
  [PlayerSkin.DOG]: {
    id: PlayerSkin.DOG,
    name: "Dog",
    description: "Loyal canine companion with extra charm",
    availability: SkinAvailability.UNLOCKABLE,
    unlockRequirement: "Special access required",
    previewImage: "/skins/preview_dog.png",
    modelComponent: "Dog",
    selectionPreview: {
      position: [0, -0.5, 0],
      scale: [0.7, 0.7, 0.7], // Adjusted to account for internal scale=2 (0.7/2 = 0.35)
      rotation: [0, 0, 0],
    },
    stylePreview: {
      position: [0, 0.75, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    },
    gameSettings: {
      position: { x: 0, y: -0.8, z: 0 },
      translationOffset: { x: -0.4, y: 0, z: 0 },
      colliderParams: [0.5, 0.65, 0.75],
      ropeJoint: 2.25,
      hatColliderOffset: 0.2,
    },
    hudSettings: {
      chatPosition: [0, 2.3, 0],
      namePosition: [0, 1.3, 0],
    },
  },
  [PlayerSkin.STUMP_CHUM]: {
    id: PlayerSkin.STUMP_CHUM,
    name: "Stump Chum",
    description: "Nature-inspired woodland character for developers",
    availability: SkinAvailability.DEV_ONLY,
    unlockRequirement: "Developer access only",
    previewImage: "/skins/preview_stumpchum.png",
    modelComponent: "StumpChum",
    selectionPreview: {
      position: [0, -0.45, 0], // Adjusted to account for internal +0.2 offset
      scale: [0.6, 0.6, 0.6], // Adjusted to account for internal 0.8 scale (0.3/0.8 = 0.375)
      rotation: [0, 0, 0],
    },
    stylePreview: {
      position: [0, 0.75, 0],
      scale: [0.8, 0.8, 0.8],
      rotation: [0, 0, 0],
    },
    gameSettings: {
      position: { x: 0, y: -0.7, z: 0 },
      translationOffset: { x: -0.4, y: 0.6, z: 0 },
      colliderParams: [0.55, 0.65, 0.55],
      ropeJoint: 2.75,
      hatColliderOffset: 0.3,
    },
    hudSettings: {
      chatPosition: [0, 2.2, 0],
      namePosition: [0, 1.1, 0],
    },
  },
  [PlayerSkin.WARPLET]: {
    id: PlayerSkin.WARPLET,
    name: "Warplet",
    description: "Warplet",
    availability: SkinAvailability.FREE,
    previewImage: "/skins/preview_warplet.png",
    modelComponent: "Warplet",
    selectionPreview: {
      position: [0, 0, 0],
      scale: [0.7, 0.7, 0.7],
      rotation: [0, 0, 0],
    },
    stylePreview: {
      position: [0, 0.75, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    },
    gameSettings: {
      position: { x: 0, y: 0.75, z: 0 },
      translationOffset: { x: -0.4, y: 0, z: 0 },
      colliderParams: [0.5, 0.65, 0.5],
      ropeJoint: 2.75,
      hatColliderOffset: 0.15,
    },
    hudSettings: {
      chatPosition: [0, 3.5, 0],
      namePosition: [0, 2.6, 0],
    },
  },
};

export const getDefaultUnlockedSkins = (): PlayerSkin[] => {
  return Object.values(SKIN_CONFIGS)
    .filter((skin) => skin.availability === SkinAvailability.FREE)
    .map((skin) => skin.id);
};
