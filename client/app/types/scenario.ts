import type { Player } from ".";
import type { Sound } from "./sfx";

export enum ScenarioId {
  PASSPORT,
}
export enum ActorId {
  PLAYER,
  TOWN_HALL_KITTY,
}
export type PlayerId = ActorId.PLAYER;
export type NpcId = Exclude<ActorId, ActorId.PLAYER>;

export interface Scenario {
  id: ScenarioId;
  actors: ScenarioActor[];
  steps: ScenarioStep[];
  state: ScenarioState;
  config: ScenarioConfig;
}

export enum ActorType {
  PLAYER,
  NPC,
}
export interface ScenarioActor {
  id: ActorId;
  name: string;
  type: ActorType;
  position: [number, number, number];
  avatarUrl?: string;
}

export interface StepCameraState {
  position?: [number, number, number];
  lookAtVec?: [number, number, number];
  lookAtActor?: ActorId;
  duration?: number;
}

export interface StepChoice {
  index: number;
  text: string;
  outcome: ChoiceOutcome;
  disabled?: boolean;
  hidden?: boolean;
}
export type ChoiceOutcome = "continue" | "exit" | { jumpTo: string };

export interface ScenarioStep {
  id: string;
  actorId: ActorId;
  text: string;
  camera?: StepCameraState;
  duration?: number;
  choices?: StepChoice[];
  outcome?: ChoiceOutcome;
  action?: StepAction;
}

export interface ScenarioState {
  currentStep: number;
  isPlaying: boolean;
  isPaused: boolean;
  isTypingComplete: boolean;
  selectedActionIndex: number | null;
}
export interface ScenarioConfig {
  isSkipAllowed?: boolean;
}

export interface BuildScenarioParams {
  actors: ScenarioActor[];
  player: Player;
}

export interface ActorRequirement {
  id: ActorId;
  type: ActorType;
}
export interface ScenarioDefinition {
  requiredActors: ActorRequirement[];
  build: (params: BuildScenarioParams) => Omit<Scenario, "state">;
}

export interface StepAction {
  id: ActionId;
  sound?: Sound;
  timing: "immediate" | "after";
}
export enum ActionId {
  CLAIM_PASSPORT,
}
