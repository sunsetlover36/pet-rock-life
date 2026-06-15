import { getDefaultUnlockedHats } from "~/config/hats";
import { getDefaultUnlockedSkins } from "~/config/skins";
import {
  Area,
  Interior,
  InteractionType,
  PlayerHat,
  type PlayerProfile,
  PlayerSkin,
  RelationshipType,
  type WorldMetadata,
  type InteractionAction,
  type InteractionCooldown,
} from "~/types";
import { loadPlayerStyle } from "./player-style";

export const createPreviewPlayer = (): PlayerProfile => {
  const now = new Date();
  const savedStyle = loadPlayerStyle();

  return {
    id: "preview",
    fid: 0,
    username: "guest",
    displayName: "Guest",
    pfpUrl: "",
    petRock: {
      id: "rock:preview",
      userId: "preview",
      name: "Rocky",
      age: 0,
      happiness: 100,
      createdAt: now,
      updatedAt: now,
    },
    isConnected: false,
    isInteracting: false,
    isAnonymous: true,
    lastUpdate: Date.now(),
    skin: savedStyle?.skin ?? PlayerSkin.SEAL,
    unlockedSkins: getDefaultUnlockedSkins(),
    hat: savedStyle?.hat ?? PlayerHat.NONE,
    unlockedHats: getDefaultUnlockedHats(),
    relationships: {},
  };
};

export const getInteractionsData = async (): Promise<{
  interactions: InteractionAction[];
  cooldowns: InteractionCooldown[];
  relationshipLevels: Record<RelationshipType, number>;
}> => ({
  interactions: [
    {
      id: InteractionType.WAVE,
      label: "Wave",
      category: "social",
      pointsRequired: 0,
      distanceRequired: 100,
    },
    {
      id: InteractionType.ADMIRE_ROCK,
      label: "Admire Rock",
      category: "social",
      pointsRequired: 5,
      distanceRequired: 10,
    },
    {
      id: InteractionType.HUG,
      label: "Hug",
      category: "social",
      pointsRequired: 50,
      distanceRequired: 2.5,
    },
    {
      id: InteractionType.BACKFLIP,
      label: "Backflip",
      category: "social",
      pointsRequired: 250,
      distanceRequired: 10,
      cooldownHours: 0.08,
    },
    {
      id: InteractionType.RITUAL,
      label: "Perform Ritual",
      category: "social",
      pointsRequired: 2000,
      distanceRequired: 5,
      cooldownHours: 24,
      usesPerDay: 1,
    },
    {
      id: InteractionType.KISS,
      label: "Kiss",
      category: "social",
      pointsRequired: 5000,
      distanceRequired: 2.5,
    },
  ],
  cooldowns: [],
  relationshipLevels: {
    [RelationshipType.STRANGER]: 0,
    [RelationshipType.ACQUAINTANCE]: 1,
    [RelationshipType.FRIEND]: Infinity,
    [RelationshipType.BEST_FRIEND]: 2500,
    [RelationshipType.MARRIED]: Infinity,
  },
});

export const getWorldMetadata = async (): Promise<WorldMetadata> => ({
  areas: {
    [Area.VILLAGE]: {
      name: "Village",
      description: "The heart of the village with shops and taverns",
      spawnPosition: [-26, 4, -15],
      position: [0, 0, 0],
      interiors: [Interior.BAR, Interior.TOWN_HALL],
    },
    [Area.KITTY_HOLLOW]: {
      name: "Kitty Hollow",
      description: "A peaceful area where spouses gather",
      spawnPosition: [1998, 2, 1998],
      position: [2000, 0, 2000],
      interiors: [],
    },
  },
  interiors: {
    [Interior.BAR]: {
      name: "The Blue Tavern",
      description: "A cozy tavern with warm drinks and good company",
      position: [1000, 0, 1000],
      entrancePosition: [20, 1, 27],
      exitPosition: [990, 3.5, 1005],
      pickups: {
        enter: [25.5, 1, 27.75],
        exit: [986, 3.2, 1010],
      },
      parentArea: Area.VILLAGE,
    },
    [Interior.TOWN_HALL]: {
      name: "Town Hall",
      description: "You can get your rock passport here",
      position: [4000, 0, 4000],
      entrancePosition: [16, 1, 50],
      exitPosition: [3993, 3, 4005],
      pickups: {
        enter: [20.65, 1, 50],
        exit: [3990, 3.5, 4008],
        passport: [4002, 2, 4004],
      },
      parentArea: Area.VILLAGE,
    },
  },
  signs: [
    {
      id: "the-blue-tavern-sign",
      text: "The Blue Tavern",
      position: [26.35, 4.5, 27.6],
      rotation: [0, 0.4, 0],
    },
    {
      id: "town-hall-sign",
      text: "Town Hall",
      position: [21.25, 4.5, 50.75],
      rotation: [0, -0.8, 0],
    },
  ],
});
