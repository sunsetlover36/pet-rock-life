import { PlayerHat, PlayerSkin } from "~/types";

export type StoredPlayerStyle = {
  skin?: PlayerSkin;
  hat?: PlayerHat;
};

const STYLE_KEY = "prl:player-style";
const PENDING_STYLE_KEY = "prl:pending-player-style";

const storage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const isSkin = (value: unknown): value is PlayerSkin =>
  typeof value === "string" &&
  Object.values(PlayerSkin).includes(value as PlayerSkin);

const isHat = (value: unknown): value is PlayerHat =>
  typeof value === "string" && Object.values(PlayerHat).includes(value as PlayerHat);

const readStyle = (key: string): StoredPlayerStyle | null => {
  const store = storage();
  if (!store) return null;

  try {
    const raw = store.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const style: StoredPlayerStyle = {};

    if (isSkin(parsed.skin)) style.skin = parsed.skin;
    if (isHat(parsed.hat)) style.hat = parsed.hat;

    return style.skin || style.hat ? style : null;
  } catch {
    store.removeItem(key);
    return null;
  }
};

const writeStyle = (key: string, style: StoredPlayerStyle) => {
  const store = storage();
  if (!store) return;

  store.setItem(
    key,
    JSON.stringify({
      ...(style.skin === undefined ? {} : { skin: style.skin }),
      ...(style.hat === undefined ? {} : { hat: style.hat }),
    }),
  );
};

export const loadPlayerStyle = () => readStyle(STYLE_KEY);

export const savePlayerStyle = (style: StoredPlayerStyle) => {
  writeStyle(STYLE_KEY, style);
};

export const savePendingPlayerStyle = (style: StoredPlayerStyle) => {
  writeStyle(PENDING_STYLE_KEY, style);
};

export const takePendingPlayerStyle = () => {
  const store = storage();
  const style = readStyle(PENDING_STYLE_KEY);
  store?.removeItem(PENDING_STYLE_KEY);
  return style;
};
