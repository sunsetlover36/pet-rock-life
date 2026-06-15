import { type FC } from "react";
import { type PlayerProfile, RelationshipType } from "~/types";
import {
  cn,
  formatAge,
  getRockHappinessColor,
  getRockHappinessLabel,
} from "~/config/utils";
import { isAnonymousPlayer, PlayerAvatar } from "~/config/player";

interface ProfilePageProps {
  relationshipLevels: Record<RelationshipType, number> | null;
  player: PlayerProfile;
  currentPlayer: PlayerProfile | null;
}

const getRelationshipDisplay = (relationship?: RelationshipType): string => {
  switch (relationship) {
    case RelationshipType.FRIEND:
      return "Friends";
    case RelationshipType.BEST_FRIEND:
      return "Best Friends";
    case RelationshipType.MARRIED:
      return "Married";
    case RelationshipType.ACQUAINTANCE:
      return "Acquaintances";
    default:
      return "Strangers";
  }
};
const getNextRelationshipLevel = (
  levels: Record<RelationshipType, number>,
  relationship?: RelationshipType,
) => {
  switch (relationship) {
    case RelationshipType.STRANGER:
      return levels[RelationshipType.ACQUAINTANCE];
    case RelationshipType.FRIEND:
      return levels[RelationshipType.BEST_FRIEND];
    case RelationshipType.ACQUAINTANCE:
    case RelationshipType.BEST_FRIEND:
    case RelationshipType.MARRIED:
      return null;
    default:
      return null;
  }
};

export const ProfilePage: FC<ProfilePageProps> = ({
  relationshipLevels,
  player,
  currentPlayer,
}) => {
  if (!currentPlayer || !player || !relationshipLevels) {
    return null;
  }

  const isOwnProfile = player.fid === currentPlayer.fid;
  const isGuest = isAnonymousPlayer(player);
  const relationship = currentPlayer.relationships[player.fid] ?? {
    points: 0,
    relationshipType: RelationshipType.STRANGER,
  };

  const nextRelationshipLevel = getNextRelationshipLevel(
    relationshipLevels,
    relationship.relationshipType,
  );
  return (
    <div className="space-y-2 p-4">
      {/* Profile Header */}
      <div className="flex flex-col text-center items-center p-4 rounded-lg">
        <div className="w-20 h-20 rounded-lg overflow-hidden mb-2">
          <PlayerAvatar
            player={player}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-[#2F2F2F]">
            {player.displayName || player.username}
          </h3>
          {!isGuest && (
            <p className="text-sm text-gray-600 mb-2">@{player.username}</p>
          )}
          {player.tag && (
            <span
              className="inline-block text-xs font-medium rounded-full px-2 py-0.5 border-2"
              style={{
                backgroundColor: player.tag.color,
                color: "#000",
              }}
            >
              {player.tag.text}
            </span>
          )}
          {!isOwnProfile && (
            <div className="font-bold text-[#FF928B]">
              {getRelationshipDisplay(relationship.relationshipType)}
            </div>
          )}
        </div>
      </div>

      {/* Relationship Progress */}
      {!isOwnProfile && (
        <div className="p-4 bg-white/50 rounded-lg border-2 border-[#FF928B]/20">
          <h4 className="text-lg font-semibold text-[#2F2F2F] mb-3">
            Relationship
          </h4>
          <div className="space-y-3">
            {/* Current Relationship Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Current Status</span>
              <span className="text-sm font-bold text-black">
                {getRelationshipDisplay(relationship.relationshipType)}
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Progress</span>
                <span className="text-sm font-bold text-black">
                  {relationship.relationshipType === RelationshipType.MARRIED
                    ? "∞"
                    : (relationship?.points.toLocaleString("en-US") ?? 0)}
                  {nextRelationshipLevel
                    ? `/${nextRelationshipLevel?.toLocaleString("en-US")}`
                    : "/∞"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#FF928B] h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(((relationship?.points ?? 0) / (nextRelationshipLevel ? nextRelationshipLevel : (relationship?.points ?? 1))) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {relationship.relationshipType === RelationshipType.BEST_FRIEND
                  ? "Marriage is the final step!"
                  : "Interact more to strengthen your relationship!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rock Summary */}
      <div className="p-4 bg-white/50 rounded-lg border-2 border-[#FF928B]/20">
        <h4 className="text-lg font-semibold text-[#2F2F2F] mb-3 flex items-center">
          Pet Rock
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <span className="font-medium text-gray-700">Name</span>
            <p className="text-black font-bold">{player.petRock.name}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Age</p>
            <p className="text-black font-bold">
              {formatAge(player.petRock.age)}
            </p>
          </div>
        </div>

        <div className="mb-3 text-sm">
          <span className="font-medium text-gray-700">Breed</span>
          <p className="text-black capitalize font-bold">
            {player.petRock.passport?.rarity || "Common"}
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-gray-700">Happiness</p>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={cn(
                  "h-3 rounded-full transition-all duration-300",
                  getRockHappinessColor(player.petRock.happiness),
                )}
                style={{ width: `${player.petRock.happiness}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-1 text-black font-medium">
            <p>{player.petRock.happiness}%</p>
            <p>{getRockHappinessLabel(player.petRock.happiness)}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="p-4 bg-white/50 rounded-lg border-2 border-[#FF928B]/20">
        <h4 className="text-lg font-semibold text-[#2F2F2F] mb-3">
          Appearance
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Skin</span>
            <p className="text-black font-bold capitalize">
              {player.skin.replace("_", " ")}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Hat</span>
            <p className="text-black font-bold capitalize">
              {player.hat === "none" ? "None" : player.hat.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
