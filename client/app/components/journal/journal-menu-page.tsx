import { miniapp } from "~/services/miniapp";
import { type FC } from "react";
import { cn } from "~/config/utils";
import { UI_IMAGES } from "~/config/images";
import { RelationshipStatus, Sound, type PlayerProfile } from "~/types";
import { soundManager } from "~/services/sound-manager";
import { Button } from "~/components/button";
import { useAtomValue } from "jotai";
import { currentPlayerAtom, wsManagerAtom } from "~/store";
import { FRIEND_RELATIONSHIP_TYPES } from "~/config/constants";
import type { ManageFriendRequestData } from "~/types/socket";
import { isAnonymousPlayer, PlayerAvatar } from "~/config/player";

interface JournalProfileActionsProps {
  player: PlayerProfile;
  isOwnProfile: boolean;
}
const JournalProfileActions: FC<JournalProfileActionsProps> = ({
  player,
  isOwnProfile,
}) => {
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const wsManager = useAtomValue(wsManagerAtom);
  const hasGuest = isAnonymousPlayer(player) || isAnonymousPlayer(currentPlayer);

  if (isOwnProfile || hasGuest || !currentPlayer || !wsManager) {
    return null;
  }

  const { relationships } = currentPlayer;
  const relationship = relationships[player.fid];

  let friendButton = {
    label: "Add Friend",
    disabled: false,
    visible: true,
  };
  let hasPendingFriendRequest = false;
  let blockButton = {
    label: "Block",
    visible: true,
  };
  if (relationship) {
    const { status, relationshipType } = relationship;

    if (status === RelationshipStatus.BLOCKED) {
      friendButton.visible = false;
      blockButton.label = "Unblock";
    } else if (FRIEND_RELATIONSHIP_TYPES.includes(relationshipType)) {
      friendButton.label = "Unfriend";
    } else if (status === RelationshipStatus.PENDING_SENT) {
      friendButton = {
        ...friendButton,
        label: "Cancel Friend Request",
      };
    } else if (status === RelationshipStatus.PENDING_RECEIVED) {
      friendButton = {
        ...friendButton,
        label: "Accept",
        disabled: false,
      };
      hasPendingFriendRequest = true;
    }
  } else {
    friendButton.disabled = true;
  }

  const onFriend = () => {
    if (!relationship) return;

    const { status, relationshipType } = relationship;
    let newStatus: ManageFriendRequestData["status"];

    if (status === RelationshipStatus.BLOCKED) {
      return;
    } else if (FRIEND_RELATIONSHIP_TYPES.includes(relationshipType)) {
      // Remove friend
      wsManager.removeFriend(player.fid);
      return;
    } else if (
      status === RelationshipStatus.PENDING_SENT ||
      status === RelationshipStatus.PENDING_RECEIVED
    ) {
      newStatus = RelationshipStatus.ACTIVE;
    }

    wsManager.manageFriendRequest({
      friendFid: player.fid,
      status: newStatus,
    });
  };
  const onDecline = () => {
    if (!relationship) return;

    const { status } = relationship;
    if (status === RelationshipStatus.PENDING_RECEIVED) {
      wsManager.manageFriendRequest({
        friendFid: player.fid,
        status: RelationshipStatus.DECLINED,
      });
    }
  };
  const onBlock = () => {
    if (
      !relationship ||
      (relationship && relationship.status !== RelationshipStatus.BLOCKED)
    ) {
      wsManager.managePlayerBlock({ fid: player.fid, block: true });
    } else if (
      relationship &&
      relationship.status === RelationshipStatus.BLOCKED
    ) {
      wsManager.managePlayerBlock({ fid: player.fid, block: false });
    }
  };

  const infoTextClassName = "text-black";
  return (
    <div className="px-4 mt-2">
      {hasPendingFriendRequest && (
        <p className={cn(infoTextClassName, "mb-1")}>
          <strong>{player.username}</strong> wants to be friends!
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {hasPendingFriendRequest && (
          <Button className="py-2 font-bold" onClick={onDecline}>
            Decline
          </Button>
        )}
        {friendButton.visible && (
          <Button
            className={cn(
              "py-2 font-bold",
              !hasPendingFriendRequest && "col-span-2",
            )}
            disabled={friendButton.disabled}
            onClick={onFriend}
          >
            {friendButton.label}
          </Button>
        )}
        <Button className="py-2 font-bold col-span-2" onClick={onBlock}>
          {blockButton.label}
        </Button>
      </div>

      {!relationship && (
        <p className={cn(infoTextClassName, "mt-1")}>
          Interact with <strong>{player.username}</strong> once to send a friend
          request!
        </p>
      )}
    </div>
  );
};

interface MenuOption {
  id: "profile" | "interactions" | "passport" | "diary";
  title: string;
  description: string;
  icon: string;
  color: string;
  disabled?: boolean;
}
interface JournalMenuPageProps extends JournalProfileActionsProps {
  onNavigate: (view: "profile" | "interactions" | "passport" | "diary") => void;
}

export const JournalMenuPage: FC<JournalMenuPageProps> = ({
  player,
  isOwnProfile,
  onNavigate,
}) => {
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const isGuest = isAnonymousPlayer(player);
  const isPlayerBlocked =
    currentPlayer &&
    currentPlayer.relationships[player.fid]?.status ===
      RelationshipStatus.BLOCKED;
  const menuOptions: MenuOption[] = [
    {
      id: "profile",
      title: "Profile",
      description: `View ${
        isOwnProfile ? "your" : `${player.username}'s`
      } player information`,
      icon: UI_IMAGES.PROFILE,
      color: "bg-blue-100 border-blue-300",
      disabled: isGuest,
    },
    ...(isOwnProfile || !player.isConnected || isPlayerBlocked
      ? []
      : [
          {
            id: "interactions" as const,
            title: "Interactions",
            description: `Interact with ${player.username}`,
            icon: UI_IMAGES.INTERACTIONS,
            color: "bg-green-100 border-green-300",
          },
        ]),
    {
      id: "passport",
      title: "Rock Passport",
      description: `${player.petRock.name}'s official document`,
      icon: UI_IMAGES.PASSPORT,
      color: "bg-purple-100 border-purple-300",
      disabled: !Boolean(player.petRock?.passport),
    },
    {
      id: "diary",
      title: "Rock Diary",
      description: `${player.petRock.name}'s personal thoughts`,
      icon: UI_IMAGES.DIARY,
      color: "bg-orange-100 border-orange-300",
      disabled: true,
    },
  ];

  const onPlayerFcClick = () => {
    if (isGuest) return;

    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.viewProfile({ fid: player.fid });
    miniapp.haptic("light");
  };

  return (
    <div className="space-y-4 py-4">
      {/* Player Header */}
      <div className="mb-4 pb-4 border-b border-[#8B4513]/20">
        <div className="flex items-start justify-between px-4">
          <div className="flex items-start">
            <div className="w-16 h-16 rounded-lg overflow-hidden mr-3">
              <PlayerAvatar
                player={player}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="-mt-1">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-[#2F2F2F] -mb-0.5">
                  {player.displayName || player.username}
                </h2>
                {!isGuest && (
                  <img
                    src="/farcaster.svg"
                    className="w-[18px] h-[18px] ml-1.5 cursor-pointer"
                    onClick={onPlayerFcClick}
                  />
                )}
              </div>
              {!isGuest && (
                <p className="text-sm text-gray-600">@{player.username}</p>
              )}
            </div>
          </div>
          <div>
            {player.tag && (
              <span
                className="inline-block text-xs font-medium rounded-full px-2 py-0.5 border"
                style={{
                  backgroundColor: player.tag.color,
                  color: "#000",
                }}
              >
                {player.tag.text}
              </span>
            )}
          </div>
        </div>

        <JournalProfileActions player={player} isOwnProfile={isOwnProfile} />
      </div>

      {/* Menu Options */}
      <div className="space-y-3 px-4">
        {menuOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => !option.disabled && onNavigate(option.id)}
            className={cn(
              `w-full p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${option.color}`,
              option.disabled &&
                "opacity-50 cursor-not-allowed active:scale-[1] hover:scale-[1]",
            )}
          >
            <div className="flex items-center space-x-4">
              <img src={option.icon} />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-[#2F2F2F]">{option.title}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <div className="text-gray-500 text-xl">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
