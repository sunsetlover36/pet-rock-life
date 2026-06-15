import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { IS_DEV } from "~/config/constants";
import { activeScenarioIdAtom, devModeAtom, isChatOpenAtom } from "~/store";

export const useKeyboardManager = () => {
  const setIsChatOpen = useSetAtom(isChatOpenAtom);
  const setActiveScenarioId = useSetAtom(activeScenarioIdAtom);
  const setDevMode = useSetAtom(devModeAtom);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          setIsChatOpen(false);
          setActiveScenarioId(null);
          break;
        case "f":
          if (IS_DEV) {
            setDevMode((prev) => (prev ? false : true));
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsChatOpen, setActiveScenarioId, setDevMode]);
};
