import { useEffect, useState, type FC } from "react";
import { UI_IMAGES } from "~/config/images";
import { cn } from "~/config/utils";
import { OnlinePlayersList } from "./online-players-list";
import { Sound, UIMode, type PlayerProfile } from "~/types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  currentPlayerAtom,
  playerProfileSheetAtom,
  selectedPlayerProfileAtom,
  uiModeAtom,
  wsManagerAtom,
} from "~/store";
import { Settings } from "../settings";
import { Button } from "../button";
import { soundManager } from "~/services/sound-manager";
import { miniapp } from "~/services/miniapp";
import { FriendsList } from "./friends-list";
import { isAnonymousPlayer } from "~/config/player";

interface PauseSheetProps {
  isOpen: boolean;
}

export const PauseSheet: FC<PauseSheetProps> = ({ isOpen }) => {
  const [playerProfileSheetOpen, setPlayerProfileSheetOpen] = useAtom(
    playerProfileSheetAtom,
  );
  const selectPlayerProfile = useSetAtom(selectedPlayerProfileAtom);
  const setUiMode = useSetAtom(uiModeAtom);
  const wsManager = useAtomValue(wsManagerAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const isGuest = isAnonymousPlayer(currentPlayer);

  const [isOnlineListVisible, setIsOnlineListVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isFriendsVisible, setFriendsVisible] = useState(false);

  const handleClose = (isDisconnecting?: boolean) => {
    setIsOnlineListVisible(false);
    setIsSettingsVisible(false);
    setFriendsVisible(false);

    if (!isDisconnecting) {
      setUiMode(UIMode.GAMEPLAY);
    } else {
      setUiMode(UIMode.MAIN_MENU);
    }
  };
  const handleDisconnect = () => {
    wsManager?.disconnect();
    handleClose(true);
  };
  const handlePlayerClick = (player: PlayerProfile) => {
    handleClose();
    selectPlayerProfile(player);
    setPlayerProfileSheetOpen(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    if (playerProfileSheetOpen) {
      handleClose();
    }
  }, [playerProfileSheetOpen]);

  const menuButtons: Array<{
    id: string;
    name: string;
    iconUrl: string;
    className?: string;
    iconClassName?: string;
    onClick?: () => void;
  }> = [
    {
      id: "resume",
      name: "Resume",
      iconUrl: UI_IMAGES.PLAY,
      className: "col-span-2",
      iconClassName: "w-4 h-5",
      onClick: handleClose,
    },
    {
      id: "online-list",
      name: "Who's Online",
      iconUrl: UI_IMAGES.PEOPLE,
      className: isGuest ? "col-span-2" : undefined,
      iconClassName: "w-6",
      onClick: () => {
        setIsOnlineListVisible(true);
      },
    },
    ...(isGuest
      ? []
      : [
          {
            id: "friends-list",
            name: "My Friends",
            iconUrl: UI_IMAGES.HEART,
            iconClassName: "w-6",
            onClick: () => {
              setFriendsVisible(true);
            },
          },
        ]),
    {
      id: "settings",
      name: "Settings",
      className: "col-span-2",
      iconUrl: UI_IMAGES.GEAR,
      onClick: () => {
        setIsSettingsVisible(true);
      },
    },
    {
      id: "main-menu",
      name: "Main Menu",
      iconUrl: UI_IMAGES.EXIT,
      className: "col-span-2",
      onClick: handleDisconnect,
    },
  ];

  let currentView = (
    <>
      {/*<h3 className="text-center text-2xl text-black font-bold mb-4">
        Pause Menu
      </h3>*/}

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {menuButtons.map((button) => {
          const { id, name, iconUrl, className, iconClassName, onClick } =
            button;

          return (
            <div
              key={id}
              className={cn(
                "bg-[#FF928B] pointer-events-auto text-center rounded-lg w-full pt-3 pb-1.5 flex items-center justify-center flex-col transition-all hover:scale-105 hover:bg-[#FF7A70] cursor-pointer text-white",
                className,
              )}
              onClick={() => {
                soundManager.playSound(Sound.MENU_CLICK);
                miniapp.haptic("light");
                onClick?.();
              }}
            >
              <img
                src={iconUrl}
                alt={name}
                className={cn("w-5 h-5 mb-2", iconClassName)}
              />
              <p className="text-lg font-bold">{name}</p>
            </div>
          );
        })}
      </div>
    </>
  );

  if (isOnlineListVisible) {
    currentView = (
      <>
        <h3 className="text-center text-2xl text-black font-bold mb-4">
          Who's in the Village
        </h3>
        <OnlinePlayersList onPlayerClick={handlePlayerClick} />
        <Button
          className="mt-4 w-full py-2 text-xl bg-[#FF928B] hover:bg-[#FF8D85]"
          onClick={() => {
            soundManager.playSound(Sound.MENU_CLICK);
            miniapp.haptic("light");
            setIsOnlineListVisible(false);
          }}
        >
          Back
        </Button>
      </>
    );
  } else if (isSettingsVisible) {
    currentView = (
      <>
        <h3 className="text-center text-2xl text-black font-bold mb-2">
          Settings
        </h3>
        <Settings />
        <Button
          className="mt-2 w-full py-2 text-xl bg-[#FF928B] hover:bg-[#FF8D85]"
          onClick={() => {
            soundManager.playSound(Sound.MENU_CLICK);
            miniapp.haptic("light");
            setIsSettingsVisible(false);
          }}
        >
          Back
        </Button>
      </>
    );
  } else if (isFriendsVisible) {
    currentView = (
      <>
        <h3 className="text-center text-2xl text-black font-bold mb-4">
          My Friends
        </h3>
        <FriendsList />
        <Button
          className="mt-4 w-full py-2 text-xl bg-[#FF928B] hover:bg-[#FF8D85]"
          onClick={() => {
            soundManager.playSound(Sound.MENU_CLICK);
            miniapp.haptic("light");
            setFriendsVisible(false);
          }}
        >
          Back
        </Button>
      </>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#FEC3A6] rounded-xl p-6 max-w-[380px] w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {currentView}
      </div>
    </div>
  );
};
