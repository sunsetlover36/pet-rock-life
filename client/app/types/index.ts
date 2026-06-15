import type { CuboidArgs } from "@react-three/rapier";
import type { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";
import type { InteractionType } from "./interaction";
import type { RockPassport } from "./passport";

export enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  jump = "jump",
  run = "run",
  petRock = "petRock",
  rockMenu = "rockMenu",
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion extends Position {
  w: number;
}

export enum PlayerSkin {
  SEAL = "seal",
  DOG = "dog",
  STUMP_CHUM = "stump_chum",
  WARPLET = "warplet",
}

export enum PlayerHat {
  NONE = "none",
  BASEBALL_CAP = "baseball_cap",
  TOY_WINDER_HAT = "toy_winder_hat",
  TRAFFIC_CONE_HAT = "traffic_cone_hat",
  CROWN_HAT = "crown_hat",
  SOMBRERO_HAT = "sombrero_hat",
  DEGEN_HAT = "degen_hat",
  HIGHER_HAT = "higher_hat",
  BACHELOR_HAT = "bachelor_hat",
  HARD_HAT = "hard_hat",
  SABITO_HAT = "sabito_hat",
  PAPERBAG_HAT = "paperbag_hat",
  UNICORN_HAT = "unicorn_hat",
  MINI_BERT_HAT = "mini_bert_hat",
  HIGHER_CROWN_HAT = "higher_crown_hat",
  NOGGLES_HAT = "noggles_hat",
}

export interface PlayerTag {
  text: string;
  color: string;
}

export interface PlayerProfile {
  id: string;
  fid: number;
  walletAddress?: string;
  username: string;
  addedMiniApp?: boolean;
  displayName: string;
  pfpUrl: string;
  petRock: PetRock;
  isConnected: boolean;
  isInteracting: boolean;
  isAnonymous?: boolean;
  lastUpdate: number;
  skin: PlayerSkin;
  unlockedSkins: PlayerSkin[];
  hat: PlayerHat;
  unlockedHats: PlayerHat[];
  tag?: PlayerTag;
  relationships: Record<number, PlayerRelationship>;
}
export interface PlayerState {
  position: Position;
  rotation: Quaternion;
  rockPosition: Position;
  rockRotation: Quaternion;
  joystick: IJoystickUpdateEvent;
}

export type Player = PlayerProfile & PlayerState;

export interface PlayerSkinSettings {
  position: Position;
  translationOffset: Position;
  ropeJoint: number;
  colliderParams: CuboidArgs;
  hatColliderOffset: number;
}

export interface PetRock {
  id: string;
  userId: string;
  name: string;
  age: number;
  happiness: number;
  passport?: RockPassport;
  createdAt: Date;
  updatedAt: Date;
}

export interface PassportPreferences {
  music: string;
  food: string;
  activity: string;
  season: string;
  timeOfDay: string;
  scent: string;
}

export interface RockDiaryEntry {
  id: string;
  rockId: string;
  content: string;
  date: string;
  timestamp: number;
}

export enum RelationshipType {
  STRANGER = "stranger",
  ACQUAINTANCE = "acquaintance",
  FRIEND = "friend",
  BEST_FRIEND = "best_friend",
  MARRIED = "married",
}

export enum RelationshipStatus {
  ACTIVE = "active",
  PENDING_SENT = "pending_sent",
  PENDING_RECEIVED = "pending_received",
  DECLINED = "declined",
  BLOCKED = "blocked",
}

export interface PlayerRelationship {
  id: string;
  sourceFid: number;
  targetFid: number;
  relationshipType: RelationshipType;
  points: number;
  status: RelationshipStatus;
  createdAt: Date;
  updatedAt: Date;
  interactions?: InteractionHistory[];
}
export interface InteractionHistory {
  id: string;
  relationshipId: string;
  interactionType: InteractionType;
  pointsAwarded: number;
  success: boolean;
  createdAt: Date;
}

export interface InteractionAction {
  id: InteractionType;
  label: string;
  category: "social" | "relationship" | "moderation";
  pointsRequired: number;
  distanceRequired: number;
  cooldownHours?: number;
  usesPerDay?: number;
  requiresConfirmation?: boolean;
  disabled?: boolean;
}

export interface PendingInteraction {
  interactionId: string;
  sourceFid: number;
  targetFid: number;
  type: string;
  sourceUsername?: string;
}
export interface PerformedInteraction {
  id: string;
  sourceFid: number;
  targetFid: number;
  type: InteractionType;
  pointsAwarded: number;
}

export interface ChatMessage {
  id: string;
  fid: number;
  name: string;
  message: string;
  timestamp: number;
}

export interface InteractionData {
  id: string;
  position: [number, number, number];
  maxDistance: number;
  content: React.ReactNode;
  className?: string;
  isVisible?: boolean;
  onInteract?: () => void;
}

export enum Screen {
  TAP_ANYWHERE = "tap-anywhere",
  MAIN_MENU = "main-menu",
  MY_STYLE = "my-style",
  SETTINGS = "settings",
  CREDITS = "credits",
}

export interface RockMessage {
  message: string;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
  isBouncing?: boolean;
}

export enum RigidBodyType {
  PLAYER = "player",
  ROCK = "rock",
}

export interface KeyboardControls {
  forward?: boolean;
  backward?: boolean;
  left?: boolean;
  right?: boolean;
  jump?: boolean;
  run?: boolean;
  petRock?: boolean;
  rockMenu?: boolean;
}

export interface Friend {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  notificationsEnabled: boolean;
  isOnline: boolean;
  alreadyInvited: boolean;
}

export * from "./ui";
export * from "./sfx";
export * from "./event";
export * from "./interaction";
export * from "./location";
export * from "./world";
export * from "./scenario";
export * from "./passport";
export * from "./settings";
