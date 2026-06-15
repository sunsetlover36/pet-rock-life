import type {
  Friend,
  PerformedInteraction,
  PlayerProfile,
  PlayerRelationship,
  RelationshipStatus,
} from ".";
import type { InteractionCooldown, InteractionType } from "./interaction";
import type { RockPassport } from "./passport";

export interface InteractionBaseData {
  sourceFid: number;
  targetFid: number;
  type: InteractionType;
}

export interface InteractionAcceptData {
  interactionId: string;
}

export interface InteractionDecisionData {
  interactionId: string;
}

export type InteractionRequestData = InteractionBaseData &
  InteractionAcceptData;

export interface MintPassportData {
  id: string;
  passport: RockPassport;
}

export interface RockRenameData {
  id: string;
  name: string;
}

export interface InteractionPerformedData {
  updatedRelationship: PlayerRelationship;
  performedInteraction: PerformedInteraction;
  updatedCooldown: InteractionCooldown;
}

export interface GetFriendsListData {
  friends: Friend[];
}
export interface ManageFriendRequestData {
  friendFid: number;
  status?: Extract<RelationshipStatus, "active" | "declined">;
}
// No need to carry interactions array for friend request
export interface FriendRequestStatusUpdate {
  sourceRelationship: Omit<PlayerRelationship, "interactions">;
  targetRelationship: Omit<PlayerRelationship, "interactions">;
}

export interface ManagePlayerBlockData {
  fid: number;
  block: boolean;
}
export interface PlayerBlockSuccessData {
  newRelationship: Omit<PlayerRelationship, "interactions">;
}

export interface PlayerViewSuccessData {
  player: PlayerProfile;
}
