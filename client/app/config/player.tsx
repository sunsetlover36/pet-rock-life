import type { PlayerProfile } from "~/types";

export const isAnonymousPlayer = (
  player?: Pick<PlayerProfile, "isAnonymous" | "pfpUrl"> | null,
) =>
  Boolean(player?.isAnonymous || !player?.pfpUrl);

export const PlayerAvatar = ({
  player,
  className,
}: {
  player: Pick<
    PlayerProfile,
    "username" | "displayName" | "pfpUrl" | "isAnonymous"
  >;
  className?: string;
}) => {
  const label = (player.displayName || player.username || "?")
    .slice(0, 1)
    .toUpperCase();

  if (!isAnonymousPlayer(player)) {
    return (
      <img
        src={player.pfpUrl}
        alt={`${player.username}'s avatar`}
        className={className}
      />
    );
  }

  return (
    <div
      className={className}
      title={player.username}
      style={{
        backgroundColor: "#8EE3F5",
      }}
    >
      <span className="flex h-full w-full items-center justify-center text-black font-black text-xl">
        {label}
      </span>
    </div>
  );
};
