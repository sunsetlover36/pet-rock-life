import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  chatMessagesAtom,
  isChatOpenAtom,
  currentPlayerAtom,
  allPlayersAtom,
} from "~/store";
import { WebSocketManager } from "~/services/socket";
import { soundManager } from "~/services/sound-manager";

import { Button } from "./button";
import { cn } from "~/config/utils";
import { UI_IMAGES } from "~/config/images";
import { Sound } from "~/types";
import { miniapp } from "~/services/miniapp";
import { useThree } from "@react-three/fiber";

interface ChatProps {
  wsManager: WebSocketManager | null;
}

export function Chat({ wsManager }: ChatProps) {
  const [messages] = useAtom(chatMessagesAtom);
  const [isOpen, setIsOpen] = useAtom(isChatOpenAtom);
  const [inputValue, setInputValue] = useState("");
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const allPlayers = useAtomValue(allPlayersAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messagesReadCount, setMessagesReadCount] = useState(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll when chat is opened or when shouldAutoScroll is true
    if (messagesEndRef.current && isOpen && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView();
    }

    if (isOpen) {
      setMessagesReadCount(messages.length);
    }
  }, [messages, isOpen, shouldAutoScroll]);

  // Reset auto-scroll when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShouldAutoScroll(true);
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 5;
    setShouldAutoScroll(isAtBottom);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && wsManager) {
      soundManager.playSound(
        Math.random() < 0.5 ? Sound.POP_1 : Sound.POP_2,
        0.3,
      );
      miniapp.haptic("heavy");
      wsManager.sendChatMessage(inputValue);
      setInputValue("");
    }
  };
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const messagesUnreadCount = messages.length - messagesReadCount;

  const highlightMentions = (text: string, currentUsername: string) => {
    const mentionRegex = new RegExp(`@${currentUsername}\\b`, "gi");
    const parts = text.split(mentionRegex);
    const mentions = text.match(mentionRegex) || [];

    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {mentions[index] && (
          <span className="bg-yellow-200 text-black px-1 rounded font-semibold">
            {mentions[index]}
          </span>
        )}
      </span>
    ));
  };

  // Helper function to get player data by ID
  const getPlayerById = (playerId: string) => {
    return allPlayers.get(playerId);
  };

  return (
    <div className="relative">
      {/* Chat Toggle Button */}
      <Button
        className={cn(
          "px-4 h-[60px] flex items-center justify-center rounded-2xl",
          isOpen && "bg-[#FF928B]",
        )}
        onClick={toggleChat}
      >
        <img src={UI_IMAGES.CHAT} className="w-6" />
        {!isOpen && messagesUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EFE9AE] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messagesUnreadCount > 99 ? "99" : messagesUnreadCount}
          </span>
        )}
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed top-24 left-8 w-80 h-48 bg-white/90 rounded-2xl flex-col z-50",
          isOpen ? "flex" : "hidden",
        )}
      >
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 pb-0 space-y-2"
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <p className="text-black/70 text-center mt-12">
              No messages yet...
            </p>
          ) : (
            messages.map((msg) => {
              if (!msg) return null;

              const player = getPlayerById(msg.fid.toString());
              const isCurrentUser = msg.fid.toString() === currentPlayer?.id;

              return (
                <div key={msg.id} className="rounded-lg">
                  <div className="text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    {player?.tag && !isCurrentUser && (
                      <span
                        className="text-xs font-bold rounded px-1 py-0.5 flex-shrink-0"
                        style={{
                          backgroundColor: player.tag.color,
                          fontSize: "0.625rem",
                          lineHeight: "0.75rem",
                        }}
                      >
                        {player.tag.text}
                      </span>
                    )}
                    <span
                      className={cn(
                        "relative top-[3px]",
                        isCurrentUser ? "text-blue-500" : "text-pink-500",
                      )}
                    >
                      {isCurrentUser ? "You" : msg.name}
                    </span>
                  </div>
                  <p className="text-sm break-words text-black">
                    {currentPlayer?.username
                      ? highlightMentions(msg.message, currentPlayer.username)
                      : msg.message}
                  </p>
                  {/* <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p> */}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-2 pt-1 flex">
          <div className="w-full flex gap-2 border border-gray-600 relative rounded-lg">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="type a message..."
              className="flex-1 p-2 text-black placeholder:text-gray-400 focus:outline-none text-sm pr-8"
              maxLength={200}
            />
            <div className="flex items-center gap-x-2">
              {/* <button
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleShare}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 256 256"
                    fill="none"
                  >
                    <rect
                      width="256"
                      height="256"
                      rx="56"
                      fill="#7C65C1"
                    ></rect>
                    <path
                      d="M183.296 71.68H211.968L207.872 94.208H200.704V180.224L201.02 180.232C204.266 180.396 206.848 183.081 206.848 186.368V191.488L207.164 191.496C210.41 191.66 212.992 194.345 212.992 197.632V202.752H155.648V197.632C155.648 194.345 158.229 191.66 161.476 191.496L161.792 191.488V186.368C161.792 183.081 164.373 180.396 167.62 180.232L167.936 180.224V138.24C167.936 116.184 150.056 98.304 128 98.304C105.944 98.304 88.0638 116.184 88.0638 138.24V180.224L88.3798 180.232C91.6262 180.396 94.2078 183.081 94.2078 186.368V191.488L94.5238 191.496C97.7702 191.66 100.352 194.345 100.352 197.632V202.752H43.0078V197.632C43.0078 194.345 45.5894 191.66 48.8358 191.496L49.1518 191.488V186.368C49.1518 183.081 51.7334 180.396 54.9798 180.232L55.2958 180.224V94.208H48.1278L44.0318 71.68H72.7038V54.272H183.296V71.68Z"
                      fill="white"
                    ></path>
                  </svg>
                </button> */}
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#FF928B] hover:bg-[#FEC3A6] ml-2 py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            <img src={UI_IMAGES.ARROW_RIGHT} className="w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
