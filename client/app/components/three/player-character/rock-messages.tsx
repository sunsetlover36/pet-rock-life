import { Html } from "@react-three/drei";
import { useAtom } from "jotai";
import { cn } from "~/config/utils";
import { rockReactionsAtom } from "~/store";
import type { PlayerProfile } from "~/types";

interface RockMessagesProps {
  profile: PlayerProfile;
}

export const RockMessages = ({ profile }: RockMessagesProps) => {
  const [reactions] = useAtom(rockReactionsAtom);
  const currentReaction = reactions.get(profile?.fid);

  if (!currentReaction) return null;

  return (
    <Html
      position={[0, 0.45, 0]}
      center
      zIndexRange={[25, 0]}
      distanceFactor={10}
      wrapperClass="pointer-events-none"
    >
      <div className="flex justify-center">
        <div
          className={cn(
            "text-xl bg-[#FEC3A6] py-1 px-2 rounded-lg",
            currentReaction.isBouncing && "animate-bounce",
          )}
        >
          {currentReaction.message}
        </div>
      </div>
    </Html>
  );
};
