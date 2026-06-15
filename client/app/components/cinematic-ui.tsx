import { useAtomValue, useSetAtom } from "jotai";
import {
  activeScenarioIdAtom,
  scenarioAtom,
  uiModeAtom,
  updateScenarioAtom,
} from "~/store";
import { Sound, UIMode, type ChoiceOutcome } from "~/types";
import { useTypewriter } from "~/hooks/use-typewriter";
import { useEffect, useState, type FC } from "react";
import { Button } from "./button";
import { X } from "lucide-react";
import { soundManager } from "~/services/sound-manager";
import { miniapp } from "~/services/miniapp";

interface DialogueTextProps {
  text: string;
  speed?: number;
  muted?: boolean;
  soundFrequency?: number;
  skipToEnd?: boolean;
  onComplete?: () => void;
}
const DialogueText: FC<DialogueTextProps> = ({
  text,
  speed = 40,
  muted = false,
  soundFrequency = 1,
  skipToEnd,
  onComplete,
}) => {
  const { displayText, isComplete } = useTypewriter(text, speed, {
    muted,
    soundFrequency,
    skipToEnd,
  });

  useEffect(() => {
    if (isComplete) {
      onComplete?.();
    }
  }, [isComplete]);

  return <p className="leading-snug">{displayText}</p>;
};

export const CinematicUI = () => {
  const uiMode = useAtomValue(uiModeAtom);
  const setActiveScenarioId = useSetAtom(activeScenarioIdAtom);
  const scenario = useAtomValue(scenarioAtom);
  const updateScenario = useSetAtom(updateScenarioAtom);

  const [isSkippedText, setIsSkippedText] = useState(false);

  const resetState = () => {
    setIsSkippedText(false);
  };
  const onExit = () => {
    soundManager.playSound(Sound.MENU_CLICK);
    miniapp.haptic("light");
    setActiveScenarioId(null);
    resetState();
  };
  useEffect(() => {
    if (!scenario) {
      resetState();
    }
  }, [scenario]);

  const isActive = scenario && uiMode === UIMode.CINEMATIC;
  if (!isActive) {
    return null;
  }

  const { actors, steps, state, config } = scenario;
  const { currentStep: currentStepIndex, isTypingComplete } = state;

  const { actorId, text, choices, outcome } = steps[currentStepIndex];
  const currentActor = actors.find((actor) => actor.id === actorId);

  const goToStep = (step: number) => {
    setIsSkippedText(false);
    updateScenario({
      nextStep: step,
      isTypingComplete: false,
    });
  };
  const onSkip = () => {
    // Had to choice, can't skip
    if (choices) {
      return;
    }

    if (!isSkippedText && !isTypingComplete) {
      setIsSkippedText(true);
    } else {
      handleOutcome(outcome ?? "continue");
    }
  };
  const handleOutcome = (outcome: ChoiceOutcome) => {
    if (outcome === "continue") {
      goToStep(currentStepIndex + 1);
    } else if (outcome === "exit") {
      onExit();
    } else {
      const jumpToIndex = steps.findIndex((step) => step.id === outcome.jumpTo);
      goToStep(jumpToIndex);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col justify-end px-4 py-8 z-50 transition-all duration-700 ease-out select-none"
      onClick={onSkip}
    >
      <Button className="absolute py-1 px-2 top-8 right-8" onClick={onExit}>
        <X />
      </Button>
      <div>
        {currentActor && (
          <div className="flex items-start bg-[#FF928B] p-4 rounded-lg relative">
            <div className="bg-[#FEC3A6] text-sm text-center rounded-lg p-1 absolute -top-5 left-5 text-black">
              {currentActor.name}
            </div>
            {isTypingComplete && !choices && (
              <p className="text-[#707070] absolute right-2 bottom-2 text-xs animate-pulse">
                Tap anywhere to continue
              </p>
            )}
            <div className="rounded-lg w-24 h-32 min-w-24 overflow-hidden">
              <img
                src={currentActor.avatarUrl}
                alt={currentActor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-32 text-black pb-4 pt-0 px-4">
              <DialogueText
                text={text}
                skipToEnd={isSkippedText}
                onComplete={() => {
                  updateScenario({
                    isTypingComplete: true,
                  });
                }}
              />
            </div>
          </div>
        )}

        {isTypingComplete && choices && choices.length > 0 && (
          <div className="mt-2 flex flex-col gap-y-2">
            {choices.map((choice) => {
              const { index, text, disabled, hidden, outcome } = choice;
              return hidden ? null : (
                <Button
                  key={index}
                  className="w-full py-2 px-4 font-bold leading-tight text-left"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOutcome(outcome);
                  }}
                >
                  {text}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
