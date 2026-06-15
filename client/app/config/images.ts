/**
 * Image constants for preloading critical UI assets
 * These images will be preloaded on app initialization to prevent flickering
 */

export const UI_IMAGES = {
  // Menu & UI Icons
  FORWARD: "/forward.png",
  DOG: "/dog.jpg",
  HERO: "/hero.png",
  ICON: "/icon.png",
  SPLASH: "/splash.png",

  // Icons
  CHAT: "/icons/chat.png",
  ARROW_RIGHT: "/icons/arrow-right.png",
  ARROW_UP: "/icons/arrow-up.png",
  PROFILE: "/icons/profile.png",
  PASSPORT: "/icons/passport.png",
  DIARY: "/icons/diary.png",
  INTERACTIONS: "/icons/interactions.png",
  PAUSE: "/icons/pause.png",
  PLAY: "/icons/play.png",
  PERSON: "/icons/person.png",
  SOUND_ON: "/icons/sound-on.png",
  SOUND_OFF: "/icons/sound-off.png",
  THREE_DOTS_HORIZONTAL: "/icons/three-dots-horizontal.png",
  GEAR: "/icons/gear.png",
  HOME: "/icons/home.png",
  EXIT: "/icons/exit.png",
  PEOPLE: "/icons/people.png",
  DISK: "/icons/disk.png",
  HEART: "/icons/heart.png",
  PLUS: "/icons/plus.png",

  // Hat Previews
  HAT_BASEBALL: "/hats/preview_baseball.png",
  HAT_TOYWINDER: "/hats/preview_toywinder.png",
  HAT_TRAFFIC_CONE: "/hats/preview_trafficcone.png",
  HAT_CROWN: "/hats/preview_crown.png",
  HAT_SOMBRERO: "/hats/preview_sombrero.png",
  HAT_BACHELOR: "/hats/preview_bachelor.png",
  HAT_HARD: "/hats/preview_hard.png",
  HAT_DEGEN: "/hats/preview_degen.png",
  HAT_HIGHER: "/hats/preview_higher.png",
  HAT_PAPERBAG: "/hats/preview_paperbag.png",

  // Skin Previews
  SKIN_SEAL: "/skins/preview_seal.png",
  SKIN_DOG: "/skins/preview_dog.png",
  SKIN_STUMP_CHUM: "/skins/preview_stumpchum.png",
} as const;

// Array of all critical images for preloading
export const CRITICAL_IMAGES = Object.values(UI_IMAGES);

// Utility type for image keys
export type UIImageKey = keyof typeof UI_IMAGES;
