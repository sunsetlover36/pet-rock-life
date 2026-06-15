import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  activeScenarioIdAtom,
  clientStore,
  currentPlayerAtom,
  scenarioAtom,
  uiModeAtom,
  wsManagerAtom,
} from "~/store";
import { loadScenario } from "./loader";
import {
  ActionId,
  UIMode,
  type Scenario,
  type ScenarioState,
  type StepAction,
} from "~/types";
import { soundManager } from "~/services/sound-manager";
import { useCameraControls } from "~/hooks/use-camera-controls";

export const ScenarioManager = () => {
  const wsManager = useAtomValue(wsManagerAtom);
  const activeScenarioId = useAtomValue(activeScenarioIdAtom);
  const setUIMode = useSetAtom(uiModeAtom);
  const [scenario, setScenario] = useAtom(scenarioAtom);

  const { cameraControls } = useCameraControls();

  const prevScenarioRef = useRef<Scenario | null>(null);
  const prevStepRef = useRef<string>("");
  const isActionTriggeredRef = useRef<boolean>(false);
  const isCameraTriggeredRef = useRef<boolean>(false);

  const handleAction = async (
    action: StepAction,
    state: ScenarioState,
  ): Promise<void> => {
    const { id, sound, timing } = action;

    if (timing === "after" && !state.isTypingComplete) {
      return;
    }

    if (sound) {
      soundManager.playSound(sound);
    }

    switch (id) {
      case ActionId.CLAIM_PASSPORT:
        const currentPlayer = clientStore.get(currentPlayerAtom);
        if (!currentPlayer?.petRock.passport) {
          wsManager?.mintPassport(); // FIXME: wsManager?. safed calls. Shouldn't be undefined at all
          console.log("Password claimed");
        }

      default: {
      }
    }
  };

  useEffect(() => {
    if (activeScenarioId === null) {
      setScenario(null);

      // Set UI mode back to gameplay if scenario ended
      if (prevScenarioRef.current !== null) {
        (async () => {
          await cameraControls.zoomOut();
          setUIMode(UIMode.GAMEPLAY);
        })();
      }

      return;
    }

    loadScenario(activeScenarioId)
      .then((scenario) => {
        console.log("Loaded scenario", scenario);
        prevScenarioRef.current = scenario;
        prevStepRef.current = "";
        setScenario(scenario);
        setUIMode(UIMode.CINEMATIC);
      })
      .catch(console.error);
  }, [activeScenarioId]);

  useEffect(() => {
    if (!scenario) return;

    const { steps, state } = scenario;
    const currentStep = steps[state.currentStep];
    if (!currentStep) return;

    if (currentStep.id !== prevStepRef.current) {
      isActionTriggeredRef.current = false;
      isCameraTriggeredRef.current = false;
      prevStepRef.current = currentStep.id;
    }

    if (currentStep.action && !isActionTriggeredRef.current) {
      isActionTriggeredRef.current = true;
      handleAction(currentStep.action, state);
    }
    if (currentStep.camera && !isCameraTriggeredRef.current) {
      const lookAtActor = currentStep.camera.lookAtActor;

      let lookAt = [0, 0, 0];
      let targetPosition = [0, 0, 0];
      if (lookAtActor) {
        const actorPosition = scenario.actors[lookAtActor].position;
        lookAt = actorPosition;
        targetPosition = [
          actorPosition[0] - 6,
          actorPosition[1] + 4,
          actorPosition[2] - 3,
        ];
      }

      cameraControls.zoomIn({
        lookAt: new THREE.Vector3(...lookAt),
        targetPosition: new THREE.Vector3(...targetPosition),
        lerpLookAt: false,
      });
    }
  }, [scenario]);

  // console.log(scenario);
  return null;
};
