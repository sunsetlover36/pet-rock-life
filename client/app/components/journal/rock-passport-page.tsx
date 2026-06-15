import { type ChangeEventHandler, type FC, useState } from "react";
import { format } from "date-fns";
import { type PlayerProfile, PassportRarity, Sound } from "~/types";
import { soundManager } from "~/services/sound-manager";
import { Button } from "../button";
import { Loader2 } from "lucide-react";
import { useAtomValue } from "jotai";
import { wsManagerAtom } from "~/store";
import { cn, getRarityColor } from "~/config/utils";

interface RockPassportPageProps {
  currentPlayer: PlayerProfile;
  selectedPlayer: PlayerProfile;
}

const getStampRotation = (type: PassportRarity): number => {
  switch (type) {
    case PassportRarity.LEGENDARY:
      return -2;
    case PassportRarity.RARE:
      return 8;
    case PassportRarity.UNCOMMON:
      return -14;
    case PassportRarity.COMMON:
    default:
      return 12;
  }
};

export const RockPassportPage: FC<RockPassportPageProps> = ({
  currentPlayer,
  selectedPlayer,
}) => {
  const isOwnProfile = currentPlayer.fid === selectedPlayer.fid;
  const wsManager = useAtomValue(wsManagerAtom);

  const [currentPage, setCurrentPage] = useState(1);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isNewNameLoading, setIsNewNameLoading] = useState(false);
  const [isNewNameError, setIsNewNameError] = useState(false);

  const totalPages = 5;
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      soundManager.playSound(Sound.MENU_CLICK);
      setCurrentPage(page);
    }
  };
  const handleNewNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    const sanitized = value.replace(/[^A-Za-z\s]+/g, "");
    const MAX_NAME_LENGTH = 24;

    if (sanitized.length > MAX_NAME_LENGTH) {
      return;
    }
    setNewName(sanitized);
  };
  const handleNameButtonClick = async () => {
    if (isEditingName) {
      try {
        wsManager?.renameRock(newName);

        setNewName("");
        setIsNewNameLoading(true);
      } catch {
        setIsNewNameError(true);
        setTimeout(() => {
          setIsNewNameError(false);
        }, 5000);
      } finally {
        setIsNewNameLoading(false);
      }
    } else {
      setIsNewNameError(false);
    }

    setIsEditingName((is) => !is);
  };

  const { petRock: rock } = selectedPlayer;
  if (!rock.passport) {
    return null;
  }
  const { name, createdAt } = rock;
  const { rarity, preferences, changedName } = rock.passport;
  const rarityColor = getRarityColor(rarity);

  const PassportPage1 = () => (
    <div className="h-full flex flex-col justify-center font-mono">
      <div
        className="text-center py-4 border-y-2"
        style={{
          borderColor: rarityColor,
        }}
      >
        <h3 className="text-xl font-bold text-[#2F2F2F] mb-1">ROCK PASSPORT</h3>
        <p className="text-sm text-gray-600">Official Document</p>
      </div>
    </div>
  );

  const PassportPage2 = () => (
    <div className="font-mono h-full flex flex-col justify-center items-center space-y-4">
      <div className="w-full space-y-3 text-center">
        <div className="border-b border-gray-300 pb-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Name
          </label>
          <div>
            {isNewNameLoading ? (
              <Loader2
                size={28}
                color="black"
                className="animate-spin mx-auto"
              />
            ) : (
              <div
                className={cn(
                  "text-lg font-bold font-sans text-[#2F2F2F] relative w-fit mx-auto flex items-center gap-x-2",
                  isEditingName ? "left-10" : "left-6",
                  (!isOwnProfile || changedName) && "left-0",
                )}
              >
                {isEditingName ? (
                  <input
                    className="border-none outline-none max-w-40 text-center"
                    autoFocus
                    value={newName}
                    onChange={handleNewNameChange}
                  />
                ) : (
                  <p>{name}</p>
                )}
                {!changedName &&
                  isOwnProfile &&
                  rarity !== PassportRarity.LEGENDARY && (
                    <Button
                      className="px-2 py-0.5 text-sm border-1"
                      disabled={isEditingName && newName.length <= 1}
                      onClick={handleNameButtonClick}
                    >
                      {isEditingName ? "Confirm" : "Edit"}
                    </Button>
                  )}
              </div>
            )}
            {isEditingName && (
              <p className="text-white rounded-lg w-fit mx-auto px-2  text-xs font-sans mt-2 bg-gray-500">
                Name can only be changed once
              </p>
            )}
            {isNewNameError && (
              <p className="text-white bg-red-500 rounded-lg w-fit mx-auto px-2  text-xs font-sans mt-2">
                Couldn't change name. Try again
              </p>
            )}
          </div>
        </div>

        <div className="border-b border-gray-300 pb-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Birth Date
          </label>
          <p className="text-lg font-bold font-sans text-[#2F2F2F]">
            {format(new Date(createdAt), "dd MMM yyyy")}
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            ID Number
          </label>
          <p className="text-lg font-sans font-bold text-[#2F2F2F]">
            {rock.id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );

  const PassportPage3 = () => (
    <div className="h-full flex flex-col font-mono items-center relative">
      <div
        className="text-center mb-12 pb-4 border-b-2 w-full"
        style={{
          borderColor: rarityColor,
        }}
      >
        <h3 className="text-xl font-bold text-[#2F2F2F] uppercase">
          Rock Classification
        </h3>
      </div>

      <div className="space-y-6 w-full">
        <div
          className="text-center p-2 rounded-lg border-4 border-[#222222] relative top-8"
          style={{
            backgroundColor: rarityColor,
            transform: `rotate(${getStampRotation(rarity)}deg)`,
          }}
        >
          <div
            className="w-full h-full border-4 rounded-lg p-2 border-dotted bg-white"
            style={{ borderColor: rarityColor }}
          >
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Classification
            </label>
            <div className="flex items-center justify-center">
              <p
                className="text-xl font-bold capitalize font-sans"
                style={{ color: rarityColor }}
              >
                {rarity}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute w-full bottom-0 left-1/2 -translate-x-1/2 mt-auto text-center text-xs text-gray-500 italic">
          Certified by the Rock Registry Authority
        </div>
      </div>
    </div>
  );

  const PassportPage4 = () => (
    <div className="h-full flex flex-col font-mono relative">
      <div
        className="text-center mb-4 pb-4 border-b-2"
        style={{
          borderColor: rarityColor,
        }}
      >
        <h3 className="text-xl font-bold text-[#2F2F2F]">PREFERENCES</h3>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key} className="border-b border-gray-400 pb-0">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <p className="text-sm text-[#2F2F2F] mt-1 ml-2 font-sans font-bold">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/*<div className="w-full absolute bottom-0 left-1/2 -translate-x-1/2 pt-4 border-t border-gray-300">
          <div className="text-center text-xs text-gray-500">
            Valid Until: Indefinite
          </div>
        </div>*/}
      </div>
    </div>
  );

  const PassportPage5 = () => (
    <div className="h-full flex flex-col relative font-mono">
      <div
        className="text-center mb-6 pb-4 border-b-2"
        style={{
          borderColor: rarityColor,
        }}
      >
        <h3 className="text-xl font-bold text-[#2F2F2F]">STAMPS</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <div
        className="bg-white/70 rounded-lg border-2 p-4 h-[400px]"
        style={{
          borderColor: rarityColor,
        }}
      >
        {currentPage === 1 && <PassportPage1 />}
        {currentPage === 2 && <PassportPage2 />}
        {currentPage === 3 && <PassportPage3 />}
        {currentPage === 4 && <PassportPage4 />}
        {currentPage === 5 && <PassportPage5 />}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#FF928B] text-black hover:bg-[#FFD1B6] active:scale-95"
          }`}
        >
          ← Prev
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentPage === index + 1
                    ? "bg-[#FF928B]"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {currentPage}/{totalPages}
          </span>
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#FF928B] text-black hover:bg-[#FFD1B6] active:scale-95"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
