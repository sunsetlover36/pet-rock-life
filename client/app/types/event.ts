export enum EventType {
  INTERACTION_ACCEPTED = "interaction_accepted",
  INTERACTION_REJECTED = "interaction_rejected",
  INTERACTION_TIMEOUT = "interaction_timeout",
  INTERACTION_REQUEST_SENT = "interaction_request_sent",
  PET_ROCK_FED = "pet_rock_fed",
  PLAYER_JOINED = "player_joined",
  PLAYER_LEFT = "player_left",
  ACHIEVEMENT_UNLOCKED = "achievement_unlocked",
  FRIENDSHIP_FORMED = "friendship_formed",
  MARRIAGE_FORMED = "marriage_formed",
  FRIEND_REQUEST_SENT = "friend_request_sent",
  FRIEND_REQUEST_RECEIVED = "friend_request_received",
  FRIEND_REQUEST_ADDED = "friend_request_added",
  FRIEND_REQUEST_DECLINED = "friend_request_declined",
}

export interface EventAlert {
  id: string;
  type: EventType;
  message: string;
  icon?: string;
  duration?: number; // default 4000ms
  timestamp: number;
  priority?: "low" | "medium" | "high";
}

export type EventAlertInput = Omit<EventAlert, "id" | "timestamp">;
