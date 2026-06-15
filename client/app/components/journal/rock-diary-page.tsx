import { type FC, useState } from "react";
import { type PetRock, type RockDiaryEntry, Sound } from "~/types";
import { soundManager } from "~/services/sound-manager";

interface RockDiaryPageProps {
  rock: PetRock;
  isOwnProfile: boolean;
}

// Mock diary entries for demonstration
const mockDiaryEntries: RockDiaryEntry[] = [
  {
    id: "1",
    rockId: "rock1",
    content:
      "Today I felt the warm sun on my surface. The human petted me gently. I think I'm getting more comfortable in this world. The other rocks seem friendly too.",
    date: "Day 15 - March 2024",
    timestamp: Date.now() - 86400000,
  },
  {
    id: "2",
    rockId: "rock1",
    content:
      "Had an interesting conversation with a moss-covered boulder today. They told me stories about the old forest. I wonder what adventures await me.",
    date: "Day 12 - March 2024",
    timestamp: Date.now() - 259200000,
  },
  {
    id: "3",
    rockId: "rock1",
    content:
      "The rain felt refreshing today. Each droplet carried whispers from the clouds. I feel more connected to the earth than ever before.",
    date: "Day 8 - March 2024",
    timestamp: Date.now() - 604800000,
  },
];

export const RockDiaryPage: FC<RockDiaryPageProps> = ({
  rock,
  isOwnProfile,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const entriesPerPage = 1;
  const totalPages = Math.max(
    1,
    Math.ceil(mockDiaryEntries.length / entriesPerPage),
  );
  const currentEntry = mockDiaryEntries[currentPage - 1];

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      soundManager.playSound(Sound.MENU_CLICK);
      setCurrentPage(page);
    }
  };

  const DiaryEntryPage = ({ entry }: { entry: RockDiaryEntry }) => (
    <div className="p-4 pl-10">
      {/* Date Header */}
      <div className="text-center pb-3 border-b border-gray-300">
        <h3 className="font-semibold text-[#2F2F2F]">{entry.date}</h3>
      </div>

      {/* Entry Content */}
      <div className="mb-4">
        <div className="text-[#2F2F2F] leading-tight whitespace-pre-wrap px-4">
          {entry.content}
        </div>
      </div>

      {/* Signature */}
      <div className="text-right mt-4">
        <p className="text-sm italic text-gray-600">{rock.name}</p>
      </div>
    </div>
  );

  const EmptyDiaryPage = () => (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[250px]">
      <span className="text-4xl mb-3">📝</span>
      <h3 className="text-base font-semibold text-[#2F2F2F] mb-2">
        No Entries Yet
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {rock.name} hasn't written any diary entries yet.
      </p>
      <p className="text-xs text-gray-500 italic">
        Rocks write their own thoughts automatically as they experience the
        world...
      </p>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      {/* Diary Content */}
      <div
        className="bg-white/70 rounded-lg border-2 border-[#8B4513] min-h-[300px] relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e6e6e6' fill-opacity='0.3'%3E%3Cpath d='M0 0h20v1H0V0zm0 19h20v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Red margin line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-300 opacity-50"></div>

        {mockDiaryEntries.length === 0 ? (
          <EmptyDiaryPage />
        ) : currentEntry ? (
          <DiaryEntryPage entry={currentEntry} />
        ) : (
          <EmptyDiaryPage />
        )}
      </div>

      {/* Navigation and Controls */}
      {mockDiaryEntries.length > 0 && (
        <div className="flex items-center justify-between bg-white/30 rounded-lg p-3">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#8B4513] text-white hover:bg-[#654321] active:scale-95"
            }`}
          >
            ← Prev
          </button>

          {/* Center Controls */}
          <div className="flex items-center space-x-3">
            {/* Page Indicators */}
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

            {/* Info Text */}
            <span className="text-xs text-gray-500">
              {currentPage}/{totalPages}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#8B4513] text-white hover:bg-[#654321] active:scale-95"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
