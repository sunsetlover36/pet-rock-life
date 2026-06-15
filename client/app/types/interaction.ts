export enum InteractionType {
  WAVE = "wave",
  ADMIRE_ROCK = "admire_rock",
  HUG = "hug",
  FRIEND_REQUEST = "friend_request",
  BACKFLIP = "backflip",
  RITUAL = "ritual",
  KISS = "kiss",
  MARRY = "marry",
}

export interface InteractionCooldown {
  id: string;
  userFid: number;
  usageCount: number;
  lastUsed: Date;
  interactionType: InteractionType;
}
