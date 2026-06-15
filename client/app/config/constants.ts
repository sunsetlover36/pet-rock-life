import { RelationshipType } from "~/types";

export const IS_DEV = import.meta.env.DEV;
export const ROCK_URL = import.meta.env.VITE_ROCK_URL || "ws://localhost:3000";

export const VERSION_NUMBER = "v0.5";
export const VERSION_LABEL = `PRL ${VERSION_NUMBER}`;

export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const SPLASHES = [
  "100% certified geological fun",
  "your rock loves you ❤️",
  "powered by sedimentary vibes",
  "no grind, only rocks",
  "believe in pet rock life",
  "pebbles?",
  "rock spa coming soon",
  "walrus-tested",
  "rocks may cry",
  "totally financial advice",
  "walruses inside, please knock",
  "digital footprint in rock",
  "$ROCK to $100m",
  "press 🪨 to pay respect",
  "your princess is in another quarry",
  "rockborn, prepare to hug",
  "ROCKOUKEN!!",
];

export const FRIEND_RELATIONSHIP_TYPES: RelationshipType[] = [
  RelationshipType.FRIEND,
  RelationshipType.BEST_FRIEND,
  RelationshipType.MARRIED,
];
