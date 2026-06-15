import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { modalStateAtom, modalVisibleAtom } from "~/store";
import { Modal } from "./modal";
import { Button } from "./button";
import { soundManager } from "~/services/sound-manager";
import { Sound } from "~/types";
import { miniapp } from "~/services/miniapp";

export function TextModal() {
  const modalState = useAtomValue(modalStateAtom);
  const setIsVisible = useSetAtom(modalVisibleAtom);

  const handleClose = () => {
    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.haptic("light");
    setIsVisible(false);
  };

  return (
    <Modal
      className="bg-[#FEC3A6] border-4 border-[#FF928B] text-black relative"
      onClose={handleClose}
    >
      {/* <div className="absolute top-4 right-4 flex justify-end">
        <X size={24} onClick={handleClose} />
      </div> */}
      <div className="flex flex-col h-full mt-2">
        <h2 className="text-center text-3xl mb-4">{modalState.header}</h2>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto max-h-72 border-4 border-gray-500 bg-[#F8F3DD] text-black p-4 rounded-lg">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">
              {modalState.text}
            </p>
          </div>
        </div>

        {/* Footer with close button */}
        <div className="mt-6 flex justify-center">
          <Button
            className="px-6 py-2 bg-[#FF928B] hover:bg-[#FF7A70] text-white rounded-lg"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
