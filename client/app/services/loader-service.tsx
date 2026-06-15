import { useProgress } from "@react-three/drei";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { VERSION_NUMBER } from "~/config/constants";
import { cn } from "~/config/utils";

const tips = [
  "feeding your rock",
  "polishing hats",
  "warming up the village",
  "summoning rocks",
  "rolling pebbles downhill",
];

interface LoaderContextValue {
  progress: number;
  loaded: number;
  total: number;
  done: boolean;
  tip: string;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

const TIP_CHANGE_MS = 3_000;
export const LoaderProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { active, progress, loaded, total } = useProgress();
  const [done, setDone] = useState(false);
  const [tip, setTip] = useState(
    () => tips[Math.floor(Math.random() * tips.length)],
  );
  const [delay, setDelay] = useState<number | null>(null); // Delay after 100% progress that marks the end of the loading process
  const batchNumber = useRef(0);
  const prevBatchDelay = useRef(0);
  const currentBatchLoadedAt = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTip(tips[Math.floor(Math.random() * tips.length)]);
    }, TIP_CHANGE_MS);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (progress === 100 && !active) {
      currentBatchLoadedAt.current = Date.now();
      setDelay((current) => {
        if (current !== null) return current;
        return Math.max(150, Math.round(prevBatchDelay.current / 2) || 250);
      });
    } else if (currentBatchLoadedAt.current !== 0) {
      batchNumber.current++;
      prevBatchDelay.current = Date.now() - currentBatchLoadedAt.current;
      console.log(
        `Batch ${batchNumber.current} was loaded in ${prevBatchDelay.current}ms`,
      );
      currentBatchLoadedAt.current = 0;

      setDelay(Math.round(prevBatchDelay.current / 2)); // Set finish delay as the loading time of previous batch divided by 2
    }
  }, [progress, active]);
  useEffect(() => {
    if (progress === 100 && !active && delay !== null) {
      const timeout = setTimeout(() => setDone(true), delay);
      return () => clearTimeout(timeout);
    }
  }, [progress, active, delay]);
  return (
    <LoaderContext.Provider
      value={{
        progress,
        loaded,
        total,
        done,
        tip,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  return useContext(LoaderContext);
};

export const LoadingScreen: FC<{
  className?: string;
}> = ({ className = "" }) => {
  const loaderState = useLoader();
  if (!loaderState || loaderState.done) return null;

  const { progress, loaded, total, tip } = loaderState;
  return (
    <div className="absolute z-[60] top-0 left-0 w-full h-full flex items-center justify-center text-white bg-gray-950 text-xl">
      <div className={cn("w-full px-16", className)}>
        <div className="text-center mb-4">
          <h1 className="text-4xl">Pet Rock Life</h1>
          <h4 className="text-xs text-gray-300">{VERSION_NUMBER}</h4>
        </div>

        <div className="w-full max-w-md mx-auto space-y-2">
          <div className="w-full rounded-full h-2 bg-gray-700 overflow-hidden">
            <div
              className="bg-[#FF928B] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-sm font-medium text-gray-300">
            {`${Math.round(progress)}% (${loaded}/${total})`}
          </div>
        </div>

        <div className="text-sm text-gray-300 text-center">{tip}</div>
      </div>
    </div>
  );
};
