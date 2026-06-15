import type { ReactNode } from "react";
import { PlayerHat, PlayerSkin } from "~/types";

export enum HatAvailability {
  FREE = "free",
  UNLOCKABLE = "unlockable",
  PURCHASE = "purchase",
}

export interface HatConfig {
  id: PlayerHat;
  name: string;
  description: string;
  availability: HatAvailability;
  unlockRequirement?: ReactNode;
  meshColor: string;
  previewImage?: string;
  modelPath: string | null;
  hidden?: boolean;
  previewPosition: {
    position: [number, number, number];
    scale: [number, number, number];
  };
  skinPositions: {
    [PlayerSkin.SEAL]: {
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    };
    [PlayerSkin.DOG]: {
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    };
    [PlayerSkin.STUMP_CHUM]: {
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    };
    [PlayerSkin.WARPLET]: {
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    };
  };
}

export const HAT_CONFIGS: Record<PlayerHat, HatConfig> = {
  none: {
    id: PlayerHat.NONE,
    name: "No Hat",
    description: "Keep it simple and natural",
    availability: HatAvailability.FREE,
    meshColor: "transparent",
    modelPath: "",
    previewPosition: {
      position: [0, 0, 0],
      scale: [1, 1, 1],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [0, 0, 0],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [0, 0, 0],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [0, 0, 0],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [0, 0, 0],
      },
    },
  },
  baseball_cap: {
    id: PlayerHat.BASEBALL_CAP,
    name: "Baseball Cap",
    description: "Classic sporty look for the athletic rock walker",
    availability: HatAvailability.FREE,
    meshColor: "#FF0000",
    previewImage: "/hats/preview_baseball.png",
    modelPath: "/hats/hat_baseball.glb",
    previewPosition: {
      position: [0, -0.3, 0],
      scale: [3.3, 3.3, 3.3],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.94, 0],
        rotation: [0.1, 0, 0],
        scale: [4, 4, 4],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.2, -0.07], // 1.55 0.5 -> 0.2 -0.07
        rotation: [-0.6, 0, 0],
        scale: [1.5, 1.5, 1.5],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.35, -0.1],
        rotation: [-0.2, 0, 0],
        scale: [4.5, 4.5, 4.5],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 1.25, -0.7],
        rotation: [-0.7, 0, 0],
        scale: [11, 11, 11],
      },
    },
  },
  toy_winder_hat: {
    id: PlayerHat.TOY_WINDER_HAT,
    name: "Toy Winder",
    description: "Wind up your style with this playful headpiece",
    availability: HatAvailability.FREE,
    meshColor: "#00FF00",
    previewImage: "/hats/preview_toywinder.png",
    modelPath: "/hats/hat_toywinder.glb",
    previewPosition: {
      position: [0, -0.6, 0],
      scale: [3, 3, 3],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 1.1, 0.05],
        rotation: [0, 0, 0],
        scale: [2.5, 2.5, 2.5],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.31, -0.1],
        rotation: [-0.5, 0, 0],
        scale: [1.1, 1.1, 1.1],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.5, 0],
        rotation: [0, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 1, -0.1],
        rotation: [-0.2, 0, 0],
        scale: [6, 6, 6],
      },
    },
  },
  traffic_cone_hat: {
    id: PlayerHat.TRAFFIC_CONE_HAT,
    name: "Traffic Cone",
    description: "Direct attention wherever you go",
    availability: HatAvailability.FREE,
    meshColor: "#FFA500",
    previewImage: "/hats/preview_trafficcone.png",
    modelPath: "/hats/hat_trafficcone.glb",
    previewPosition: {
      position: [0, -0.55, 0],
      scale: [2.5, 2.5, 2.5],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 1.08, 0.05],
        rotation: [0.1, 0, 0],
        scale: [2, 2, 2],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.31, -0.1],
        rotation: [-0.5, 0, 0],
        scale: [1.1, 1.1, 1.1],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.49, -0.1],
        rotation: [-0.1, 0, 0],
        scale: [2.3, 2.3, 2.3],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 1.1, -0.6],
        rotation: [-0.5, 0, 0],
        scale: [6, 6, 6],
      },
    },
  },
  crown_hat: {
    id: PlayerHat.CROWN_HAT,
    name: "Crown",
    description: "Rule your rock kingdom with royal style",
    availability: HatAvailability.FREE,
    meshColor: "#FFD700",
    previewImage: "/hats/preview_crown.png",
    modelPath: "/hats/hat_crown.glb",
    previewPosition: { position: [0, -0.5, 0], scale: [3, 3, 3] },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 1.08, 0.05],
        rotation: [0.04, 0, 0],
        scale: [2.5, 2.5, 2.5],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.24, -0.07],
        rotation: [-0.5, 0, 0],
        scale: [1.2, 1.2, 1.2],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.48, -0.02],
        rotation: [-0.05, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0.8, -0.6],
        rotation: [-0.5, 0, 0],
        scale: [6, 6, 6],
      },
    },
  },
  sombrero_hat: {
    id: PlayerHat.SOMBRERO_HAT,
    name: "Sombrero",
    description: "Bring the fiesta spirit to your rock adventures",
    availability: HatAvailability.FREE,
    meshColor: "#8B4513",
    previewImage: "/hats/preview_sombrero.png",
    modelPath: "/hats/hat_sombrero.glb",
    previewPosition: {
      position: [0, -0.1, 0],
      scale: [2.5, 2.5, 2.5],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 1.1, 0.05],
        rotation: [0.15, 0, 0],
        scale: [2.3, 2.3, 2.3],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.31, -0.1],
        rotation: [-0.5, 0, 0],
        scale: [1.1, 1.1, 1.1],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.55, -0.03],
        rotation: [-0.05, 0, 0],
        scale: [2.4, 2.4, 2.4],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 1, -0.7],
        rotation: [-0.2, 0, 0],
        scale: [6, 6, 6],
      },
    },
  },
  bachelor_hat: {
    id: PlayerHat.BACHELOR_HAT,
    name: "Bachelor",
    description: "Scholarly style for the educated rock enthusiast",
    availability: HatAvailability.UNLOCKABLE,
    unlockRequirement: "Your rock is more than a month old",
    meshColor: "#000000",
    previewImage: "/hats/preview_bachelor.png",
    modelPath: "/hats/hat_bachelor.glb",
    previewPosition: {
      position: [0, -0.3, 0],
      scale: [3, 3, 3],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.99, 0.05],
        rotation: [0, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.23, -0.07],
        rotation: [-0.4, 0, 0],
        scale: [1.6, 1.6, 1.6],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.5, -0.1],
        rotation: [-0.15, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0.8, -0.6],
        rotation: [-0.5, 0, 0],
        scale: [6, 6, 6],
      },
    },
  },
  hard_hat: {
    id: PlayerHat.HARD_HAT,
    name: "Hard Hat",
    description: "Safety first in the rock construction zone",
    availability: HatAvailability.UNLOCKABLE,
    unlockRequirement: (
      <>
        <p>First to screenshot upside-down menu</p>
        <p className="text-xs">
          owned by <b>@bombaymalayali</b>
        </p>
      </>
    ),
    meshColor: "#FFFF00",
    previewImage: "/hats/preview_hard.png",
    modelPath: "/hats/hat_hard.glb",
    previewPosition: {
      position: [0, -0.4, 0],
      scale: [3, 3, 3],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.89, 0.05],
        rotation: [0.1, 0, 0],
        scale: [3.5, 3, 3],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.23, -0.07],
        rotation: [-0.5, 0, 0],
        scale: [1.1, 1.1, 1.1],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.44, -0.1],
        rotation: [-0.1, 0, 0],
        scale: [2.5, 2.5, 2.5],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0.85, -0.5],
        rotation: [-0.3, 0, 0],
        scale: [6, 6, 6],
      },
    },
  },
  degen_hat: {
    id: PlayerHat.DEGEN_HAT,
    name: "Degen",
    description: "Hat stays on?",
    availability: HatAvailability.UNLOCKABLE,
    unlockRequirement: "???",
    meshColor: "#800080",
    previewImage: "/hats/preview_degen.png",
    modelPath: "/hats/hat_degen.glb",
    previewPosition: {
      position: [0, -0.4, 0],
      scale: [3.2, 3.2, 3.2],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.9, 0.05],
        rotation: [0.05, 0, 0],
        scale: [4, 4, 4],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.23, -0.07],
        rotation: [-0.5, 0, 0],
        scale: [1.6, 1.6, 1.6],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.46, -0.05],
        rotation: [-0.1, 0, 0],
        scale: [2.7, 2.7, 2.7],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0.85, -0.6],
        rotation: [-0.5, 0, 0],
        scale: [6, 6, 6],
      },
    },
  },
  higher_hat: {
    id: PlayerHat.HIGHER_HAT,
    name: "Higher",
    description: "Say no more",
    availability: HatAvailability.UNLOCKABLE,
    unlockRequirement: "???",
    meshColor: "#00FFFF",
    previewImage: "/hats/preview_higher.png",
    modelPath: "/hats/hat_higher.glb",
    previewPosition: {
      position: [0, -0.4, 0],
      scale: [3.5, 3.5, 3.5],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.8, 0.3],
        rotation: [0.1, -1.1, 0],
        scale: [4, 4, 4],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.25, 0.07],
        rotation: [-0.6, -1.1, 0],
        scale: [1.6, 1.6, 1.6],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.33, 0.1],
        rotation: [-0.15, -0.9, 0],
        scale: [4, 4, 4],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0.525, -0.3],
        rotation: [-0.7, 0, 0],
        scale: [9, 9, 9],
      },
    },
  },
  sabito_hat: {
    id: PlayerHat.SABITO_HAT,
    name: `Sabito's Mask`,
    description: `Legendary Sabito's mask from Demon Slayer: Kimetsu No Yaiba`,
    availability: HatAvailability.UNLOCKABLE,
    unlockRequirement: "You joined the village before August 4, 2025",
    meshColor: "#00FFFF",
    previewImage: "/hats/preview_sabito.png",
    modelPath: "/hats/hat_sabito.glb",
    previewPosition: {
      position: [0, -0.3, 0],
      scale: [3, 3, 3],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.52, 0.75],
        rotation: [-0.15, -Math.PI / 2, 0],
        scale: [1, 0.55, 0.55],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.28, 0.07],
        rotation: [-0.5, -Math.PI / 2, 0],
        scale: [0.45, 0.25, 0.25],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.2, 0.64],
        rotation: [-0.6, -Math.PI / 2, 0],
        scale: [1.3, 0.6, 0.6],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, -0.3, 1.4],
        rotation: [-0.05, -Math.PI / 2, 0],
        scale: [2.3, 2.3, 2.3],
      },
    },
  },
  paperbag_hat: {
    id: PlayerHat.PAPERBAG_HAT,
    name: "Paper Bag",
    description: "Paper Bag Cult",
    availability: HatAvailability.PURCHASE,
    unlockRequirement: "You can support me and receive this hat ❤️",
    meshColor: "#D2B48C",
    previewImage: "/hats/preview_paperbag.png",
    modelPath: "/hats/hat_paperbag.glb",
    previewPosition: {
      position: [0, -0.3, 0],
      scale: [2.8, 2.8, 2.8],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.35, 0.5],
        rotation: [0.125, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.05, 0],
        rotation: [-0.5, 0, 0],
        scale: [1.25, 1.25, 1.6],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 0.7, 0],
        rotation: [0, 0, 0],
        scale: [5.4, 4, 6.75],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, -0.75, 0],
        rotation: [-0.1, 0, 0],
        scale: [12.5, 11, 12.5],
      },
    },
  },
  unicorn_hat: {
    id: PlayerHat.UNICORN_HAT,
    name: "Unicorn",
    description: "Have fun on the event!",
    unlockRequirement: "Unlocks on some events",
    availability: HatAvailability.UNLOCKABLE,
    meshColor: "#FFA500",
    previewImage: "/hats/preview_unicorn.png",
    modelPath: "/hats/hat_unicorn.glb",
    previewPosition: {
      position: [0, -0.55, 0],
      scale: [2.5, 2.5, 2.5],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.99, 0.05],
        rotation: [0.1, 0, 0],
        scale: [2.2, 2.2, 2.2],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.25, -0.07],
        rotation: [-0.5, 0, 0],
        scale: [1, 1, 1],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.28, -0.1],
        rotation: [-0.1, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0.8, -0.5],
        rotation: [-0.4, 0, 0],
        scale: [5, 5, 5],
      },
    },
  },
  // FIXME: mini hat without skeleton, separate model
  mini_bert_hat: {
    id: PlayerHat.MINI_BERT_HAT,
    name: "Mini Bert",
    description: "ssssmklasdjkklasdj;;;,,00",
    availability: HatAvailability.FREE,
    meshColor: "#FDB833",
    previewImage: "/skins/preview_dog.png",
    modelPath: "/skins/skin_dog.glb",
    hidden: true,
    previewPosition: {
      position: [0, 0, 0],
      scale: [0.7, 0.7, 0.7],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, -1, -0.15],
        rotation: [0, 0, 0],
        scale: [2.2, 2.2, 2.2],
      },
      [PlayerSkin.DOG]: {
        position: [0, 1.25, 0],
        rotation: [-0.5, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.28, -0.1],
        rotation: [-0.1, 0, 0],
        scale: [3, 3, 3],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 1.35, -0.1],
        rotation: [-0.2, 0, 0],
        scale: [4.5, 4.5, 4.5],
      },
    },
  },
  higher_crown_hat: {
    id: PlayerHat.HIGHER_CROWN_HAT,
    name: "Higher Crown",
    description: "For those above the everything",
    availability: HatAvailability.FREE,
    meshColor: "#00FFFF",
    previewImage: "/hats/preview_higher_crown.png",
    modelPath: "/hats/hat_higher_crown.glb",
    previewPosition: {
      position: [0, -0.4, 0],
      scale: [3.5, 3.5, 3.5],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.97, 0.1],
        rotation: [0.1, 0.65, 0],
        scale: [6, 6, 6],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.26, -0.1],
        rotation: [-0.5, 0.65, 0],
        scale: [2, 2, 2],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.405, -0.1],
        rotation: [-0.08, 0.65, 0],
        scale: [6, 6, 6],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0.8, -0.6],
        rotation: [-0.4, 0, 0],
        scale: [10, 10, 10],
      },
    },
  },
  noggles_hat: {
    id: PlayerHat.NOGGLES_HAT,
    name: "Noggles",
    description: "see the world nounish",
    availability: HatAvailability.FREE,
    meshColor: "#E84855",
    previewImage: "/hats/preview_noggles.png",
    modelPath: "/hats/hat_noggles.glb",
    previewPosition: {
      position: [0, -0.4, 0],
      scale: [3.5, 3.5, 3.5],
    },
    skinPositions: {
      [PlayerSkin.SEAL]: {
        position: [0, 0.35, 0.47],
        rotation: [0.03, Math.PI / 2, 0],
        scale: [4, 4, 4.4],
      },
      [PlayerSkin.DOG]: {
        position: [0, 0.13, 0],
        rotation: [-0.5, Math.PI / 2, 0],
        scale: [1.75, 1.75, 1.9],
      },
      [PlayerSkin.STUMP_CHUM]: {
        position: [0, 1.1, 0.29],
        rotation: [-0.2, Math.PI / 2, 0],
        scale: [4.5, 4.5, 5],
      },
      [PlayerSkin.WARPLET]: {
        position: [0, 0, 0.1],
        rotation: [-0.5, Math.PI / 2, 0],
        scale: [12, 11, 12],
      },
    },
  },
};

export const getDefaultUnlockedHats = (): PlayerHat[] => {
  return Object.values(HAT_CONFIGS)
    .filter((hat) => hat.availability === HatAvailability.FREE)
    .map((hat) => hat.id);
};
