export enum UIMode {
  MAIN_MENU = "main-menu",
  GAMEPLAY = "gameplay",
  CINEMATIC = "cinematic",
  PAUSED = "paused",
  HIDDEN = "hidden",
}
export enum UIComponent {
  JOYSTICK = "joystick",
  CHAT = "chat",
  PAUSE_BUTTON = "pause-button",
}

export interface UIState {
  mode: UIMode;
  previousMode?: UIMode;
  components: Record<UIComponent, boolean>;
}
