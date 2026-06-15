import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { friendsAtom, wsManagerAtom } from "~/store";
import { Button } from "../button";
import { cn } from "~/config/utils";
import { UI_IMAGES } from "~/config/images";

export const FriendsList = () => {
  const wsManager = useAtomValue(wsManagerAtom);
  const friends = useAtomValue(friendsAtom);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchStr, setSearchStr] = useState("");
  const [invitedFriends, setInvitedFriends] = useState<Record<number, boolean>>(
    {},
  );
  const [activeTab, setActiveTab] = useState<"offline" | "online">("offline");

  useEffect(() => {
    wsManager?.getFriendsList();
  }, [wsManager]);

  const resetSearch = () => {
    setSearchVisible(false);
    setSearchStr("");
  };
  const changeTab = (tab: typeof activeTab) => {
    resetSearch();
    setActiveTab(tab);
  };
  const inviteFriend = (fid: number) => {
    setInvitedFriends((f) => ({
      ...f,
      [fid]: true,
    }));
    wsManager?.inviteFriends({ fids: [fid] });
  };

  const tabButtonClassName = "py-2 px-6 transition-colors ease-in-out";
  const activeTabButtonClassName = "bg-[#FF928B] hover:bg-[#FF928B] font-bold";

  const searchStrRegex = useMemo(
    () => new RegExp(searchStr, "gi"),
    [searchStr],
  );
  const filteredFriends = friends.filter((friend) => {
    const byTab = activeTab === "offline" ? !friend.isOnline : friend.isOnline;
    const byUsername = searchStrRegex.test(friend.username);
    const byDisplayName =
      !friend.displayName || searchStrRegex.test(friend.displayName);

    return byTab && byUsername && byDisplayName;
  });

  let emptyListComponent = null;
  if (filteredFriends.length === 0) {
    emptyListComponent =
      searchStr.length === 0 ? (
        <div>
          <h3 className="text-xl text-center">No friends {activeTab}</h3>
          <p className="text-gray-800 text-sm text-center">
            {activeTab === "offline"
              ? "Find friends in the village!"
              : "Invite friends to play together!"}
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-xl text-center">No friends found</h3>
        </div>
      );
  }
  return (
    <div>
      <div className="flex mx-auto w-fit mb-4">
        <Button
          className={cn(
            tabButtonClassName,
            "border-l-4 rounded-r-none border-r-0",
            activeTab === "offline" && activeTabButtonClassName,
          )}
          onClick={() => {
            changeTab("offline");
          }}
        >
          Offline
        </Button>
        <Button
          className={cn(
            tabButtonClassName,
            "border-r-4 rounded-l-none border-l-0",
            activeTab === "online" && activeTabButtonClassName,
          )}
          onClick={() => {
            changeTab("online");
          }}
        >
          Online
        </Button>
      </div>
      <div className="text-black max-h-[280px] p-2 overflow-y-auto">
        {filteredFriends.length > 0
          ? filteredFriends.map((friend) => {
              const { fid, pfpUrl, username, displayName, alreadyInvited } =
                friend;

              const isInvited = alreadyInvited || invitedFriends[fid];
              return (
                <div
                  key={fid}
                  className="flex items-center justify-between bg-[#F8F3DD] p-4 mb-4 last:mb-0 rounded-lg cursor-pointer hover:scale-105 transition-all"
                  onClick={() => {
                    wsManager?.viewPlayerProfile({ fid });
                  }}
                >
                  <div className="flex items-center gap-x-4">
                    <img
                      src={pfpUrl}
                      alt={`${username}'s pic`}
                      className="rounded-lg w-12 h-12"
                    />
                    <div className="relative -top-0.5">
                      <h3 className="text-xl font-bold">{displayName}</h3>
                      <p className="-mt-0.5 text-sm text-gray-500">
                        @{username}
                      </p>
                    </div>
                  </div>
                  {/* FIXME: Might need to increase tapping area (invisible handler full height the parent). Fix bs with propagation? */}
                  {activeTab === "offline" && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();

                        if (!isInvited) {
                          inviteFriend(fid);
                        }
                      }}
                    >
                      <Button
                        className="bg-[#FF928B] border-none py-2.5 px-4 text-sm"
                        disabled={isInvited}
                      >
                        {isInvited ? "Invited!" : "Invite"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          : emptyListComponent}
      </div>

      {searchVisible ? (
        <div className="flex items-center mt-4 h-[52px] gap-3">
          <Button
            className="bg-[#FF928B] hover:bg-[#FF8D85] flex items-center justify-center px-2.5 h-full w-[52px] flex-shrink-0"
            onClick={resetSearch}
          >
            <img src={UI_IMAGES.PLUS} className="w-6 h-6 rotate-45" />
          </Button>

          <input
            type="text"
            className="flex-1 min-w-0 border-4 border-[#FF928B] rounded-lg h-full placeholder-gray-600 text-lg px-4 outline-none text-black"
            placeholder="tap to search..."
            autoFocus
            value={searchStr}
            onChange={(e) => {
              setSearchStr(e.target.value);
            }}
          />
        </div>
      ) : (
        <Button
          className="mt-4 w-full py-2 text-xl bg-[#FF928B] hover:bg-[#FF8D85]"
          onClick={() => {
            setSearchVisible(true);
          }}
        >
          Search
        </Button>
      )}
    </div>
  );
};
