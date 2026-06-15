import { InteractionType } from "~/types";

export const getInteractionLabel = (type: string): string => {
  switch (type) {
    case InteractionType.WAVE:
      return "wave";
    case InteractionType.HUG:
      return "hug";
    case InteractionType.ADMIRE_ROCK:
      return "admire rock";
    case InteractionType.FRIEND_REQUEST:
      return "friend request";
    case InteractionType.BACKFLIP:
      return "backflip";
    case InteractionType.RITUAL:
      return "ritual";
    case InteractionType.KISS:
      return "kiss";
    case InteractionType.MARRY:
      return "marry";
    default:
      return type;
  }
};

export const getInteractionEmoji = (type: string): string => {
  switch (type) {
    case InteractionType.WAVE:
      return "👋";
    case InteractionType.HUG:
      return "🤗";
    case InteractionType.ADMIRE_ROCK:
      return "🪨";
    case InteractionType.FRIEND_REQUEST:
      return "👥";
    case InteractionType.BACKFLIP:
      return "🤸";
    case InteractionType.RITUAL:
      return "🔮";
    case InteractionType.KISS:
      return "💋";
    case InteractionType.MARRY:
      return "💍";
    default:
      return "🤝";
  }
};
