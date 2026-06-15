import { Html } from "@react-three/drei";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { SKIN_CONFIGS } from "~/config/skins";
import { activeInteractionFamily, playerMessagesFamily } from "~/store";
import { InteractionType, type ChatMessage, type PlayerProfile } from "~/types";

interface PlayerMessagesProps {
  profile: PlayerProfile;
}
export const PlayerMessages = ({ profile }: PlayerMessagesProps) => {
  const playerMessages = useAtomValue(playerMessagesFamily(profile.id));
  const activeInteraction = useAtomValue(activeInteractionFamily(profile.fid));

  const prevMessagesLength = useRef(playerMessages.length);
  const joinTimestamp = useRef(Date.now());
  const timeoutsRef = useRef<Array<NodeJS.Timeout>>([]);

  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (!activeInteraction) return;

    if (activeInteraction?.type === InteractionType.WAVE) {
      setNewMessages((prev) =>
        [
          ...prev,
          {
            id: "wave",
            name: profile.username,
            fid: profile.fid,
            message: "👋",
            timestamp: Date.now(),
          },
        ]
          .reverse()
          .slice(0, 5)
          .reverse(),
      );

      timeoutsRef.current.push(
        setTimeout(() => {
          setNewMessages((prev) => prev.filter((msg) => msg.id !== "wave"));
        }, 5000),
      );
    }
  }, [activeInteraction]);
  useEffect(() => {
    if (playerMessages.length > prevMessagesLength.current) {
      const newlyAdded = playerMessages
        .slice(prevMessagesLength.current)
        .filter((msg) => msg.timestamp > joinTimestamp.current);

      setNewMessages((prev) =>
        [...prev, ...newlyAdded].reverse().slice(0, 5).reverse(),
      );

      newlyAdded.forEach((message, index) => {
        timeoutsRef.current.push(
          setTimeout(
            () => {
              setNewMessages((prev) =>
                prev.filter((msg) => msg.id !== message.id),
              );
            },
            5000 + index * 500,
          ),
        );
      });
    }

    prevMessagesLength.current = playerMessages.length;
  }, [playerMessages]);

  const hudConfig = SKIN_CONFIGS[profile.skin].hudSettings;
  return (
    <Html
      position={hudConfig.chatPosition}
      center
      zIndexRange={[30, 0]}
      distanceFactor={10}
    >
      <div className="flex flex-col-reverse h-[14vh]">
        {newMessages.length > 0 &&
          [...newMessages].reverse().map((msg) => (
            <p
              key={msg.id}
              className="bg-[#FEC3A6] text-black py-1 px-2 text-center rounded-lg mb-1 first:mb-0 mx-auto"
              style={{
                width: "max-content",
                maxWidth: "18rem",
              }}
            >
              {msg.message.length > 80
                ? `${msg.message.slice(0, 80)}...`
                : msg.message}
            </p>
          ))}
      </div>
    </Html>
  );
};
