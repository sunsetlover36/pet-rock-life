import { useMemo } from "react";
import {
  PlayerSkin,
  PlayerHat,
  type PetRock,
  type Player,
  type PlayerTag,
} from "~/types";

export const useFakePlayers = (count: number = 50) => {
  return useMemo(() => {
    const fakePlayersMap = new Map<string, Player>();

    for (let i = 0; i < count; i++) {
      const petRock: PetRock = {
        id: `rock-${i}`,
        name: `Rocky ${i}`,
        age: Math.floor(Math.random() * 365) + 1, // 1-365 days
        happiness: Math.floor(Math.random() * 100) + 1, // 1-100
        lastPetTime: Date.now() - Math.random() * 3600000, // Random time in last hour
        ownerId: `fake-player-${i}`,
      };

      const tag: PlayerTag | undefined =
        i < 10
          ? {
              text: `VIP ${i}`,
              color: "#FFD700",
            }
          : undefined;

      const player: Player = {
        id: `fake-player-${i}`,
        fid: 1000 + i,
        username: `player${i}`,
        displayName: `Test Player ${i}`,
        pfpUrl: `https://picsum.photos/64/64?random=${i}`,
        position: {
          x: (Math.random() - 0.5) * 30, // Random positions
          y: 1,
          z: (Math.random() - 0.5) * 30,
        },
        rotation: {
          x: 0,
          y: Math.random() * Math.PI * 2, // Random Y rotation
          z: 0,
          w: 1,
        },
        rockPosition: {
          x: (Math.random() - 0.5) * 30 + 2, // Near player
          y: 1,
          z: (Math.random() - 0.5) * 30 + 2,
        },
        rockRotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        joystick: {
          type: "stop",
          x: 0,
          y: 0,
          direction: null,
          distance: 0,
        },
        petRock,
        isConnected: true,
        lastUpdate: Date.now(),
        skin: i % 3 === 0 ? PlayerSkin.DOG : PlayerSkin.SEAL, // Mix of skins
        unlockedSkins: [PlayerSkin.SEAL, PlayerSkin.DOG],
        hat: i % 4 === 0 ? PlayerHat.BASEBALL_CAP : PlayerHat.NONE, // Mix of hats
        unlockedHats: [PlayerHat.NONE, PlayerHat.BASEBALL_CAP],
        tag,
      };

      fakePlayersMap.set(player.id, player);
    }

    return fakePlayersMap;
  }, [count]);
};
