import {
  ActionId,
  ActorId,
  ActorType,
  ScenarioId,
  Sound,
  type ScenarioDefinition,
} from "~/types";

export const scenarioRegistry: Record<ScenarioId, ScenarioDefinition> = {
  [ScenarioId.PASSPORT]: {
    requiredActors: [
      {
        id: ActorId.PLAYER,
        type: ActorType.PLAYER,
      },
      {
        id: ActorId.TOWN_HALL_KITTY,
        type: ActorType.NPC,
      },
    ],
    build: ({ actors, player }) => ({
      id: ScenarioId.PASSPORT,
      actors,
      steps: [
        {
          id: "greeting",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Meow! Welcome to the Rock Town Hall passport office!",
          camera: { lookAtActor: ActorId.TOWN_HALL_KITTY },
          choices: [
            {
              index: 0,
              text: "I want to issue a passport!",
              outcome: "continue",
              hidden:
                Boolean(player.petRock.passport) ||
                player.petRock.age < 60 * 60 * 24 * 30,
            },
            {
              index: 1,
              text: `Just petting the cutest kitty of Pet Rock Village!`,
              outcome: { jumpTo: "pet" },
            },
          ],
        },
        {
          id: "verify",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Ooh, a new citizen! Let me check if you're in my big book of residents, meow!",
        },
        {
          id: "verify_typing",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Hmm, let's see here, nya...",
        },
        {
          id: "found",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Found you! One shiny new Rock Passport coming right up! But first... the CEREMONY!",
          choices: [
            { index: 0, text: "Ceremony?", outcome: "continue" },
            {
              index: 1,
              text: "Let's do this!",
              outcome: { jumpTo: "ceremony_start" },
            },
          ],
        },
        {
          id: "explain",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Every new passport holder must complete the Great Rock ritual! Don't worry, it's super meow!",
        },
        {
          id: "ceremony_start",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Please raise your right hand and repeat after me!",
        },
        {
          id: "oath_1",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "I solemnly swear to be the very best, like no one ever was...",
          choices: [
            {
              index: 0,
              text: "I solemnly swear to be the very best, like no one ever was!",
              outcome: "continue",
            },
            { index: 1, text: "Wait...", outcome: { jumpTo: "oath_joke" } },
          ],
        },
        {
          id: "oath_2",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "To explore Pet Rock Village is my real test, to have fun is my meow!",
          choices: [
            {
              index: 0,
              text: "To explore Pet Rock Village is my real test, to have fun is my meow!",
              outcome: "continue",
            },
          ],
        },
        {
          id: "stamp_time",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "*pulls out a MASSIVE golden stamp* Now for the most important part... THE MEGA STAMP OF APPROVAL!",
        },
        {
          id: "stamp_action",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "MEOW! *STAMP*",
          duration: 1000,
          action: {
            id: ActionId.CLAIM_PASSPORT,
            timing: "immediate",
            sound: Sound.STAMP,
          },
        },
        {
          id: "complete",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Congratulations! You are now an official Pet Rock citizen! MEOW! Check your journal (just tap on yourself, I know it feels a bit unusual..)",
          choices: [
            { index: 0, text: "Thank you, Ms. Kitty!", outcome: "continue" },
            { index: 1, text: "That was amazing!", outcome: "continue" },
          ],
        },
        {
          id: "farewell",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Welcome to Pet Rock Life :3 Come visit me anytime for head pats- I MEAN.. official village business, meow!",
          outcome: "exit",
        },
        {
          id: "pet",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "*purrrrrrrr* MEOW~ that's nice but I'm on duty! Come back when you need official documents, meow!",
          outcome: "exit",
        },
        {
          id: "oath_joke",
          actorId: ActorId.TOWN_HALL_KITTY,
          text: "Shh! *whispers* Someone say that the Mayor is a big Pokémon fan! Now where were we...",
          outcome: { jumpTo: "oath_2" },
        },
      ],
      config: {},
    }),
  },
};
