export enum PassportRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  LEGENDARY = "legendary",
}

export interface PassportPreferences {
  music: string;
  food: string;
  activity: string;
  season: string;
  timeOfDay: string;
  scent: string;
}

export interface PassportTemplate {
  name: string;
  traits: string[];
  preferences: PassportPreferences;
  templateId?: string;
}

export interface RockPassport {
  id: string;
  rockId: string;
  issuedAt: Date;
  name: string;
  rarity: PassportRarity;
  traits: string[];
  preferences: PassportPreferences;
  templateId?: string | null;
  changedName: boolean;
}
