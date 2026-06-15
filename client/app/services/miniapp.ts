import { sdk } from "@farcaster/miniapp-sdk";

const getMiniAppContext = async () => {
  if (!sdk) return null;

  try {
    const context = await sdk.context;
    return context?.client ? context : null;
  } catch {
    return null;
  }
};

const run = async <T>(callback: () => T | Promise<T>): Promise<T | null> => {
  const context = await getMiniAppContext();
  if (!context) return null;

  try {
    return await callback();
  } catch (error) {
    console.warn("Farcaster Mini App SDK is unavailable", error);
    return null;
  }
};

export const miniapp = {
  context: getMiniAppContext,
  quickAuthToken: () => run(async () => (await sdk.quickAuth.getToken()).token),
  ready: (options?: Parameters<typeof sdk.actions.ready>[0]) =>
    run(() => sdk.actions.ready(options)),
  close: () => run(() => sdk.actions.close()),
  addMiniApp: () => run(() => sdk.actions.addMiniApp()),
  viewProfile: (options: Parameters<typeof sdk.actions.viewProfile>[0]) =>
    run(() => sdk.actions.viewProfile(options)),
  haptic: (style: Parameters<typeof sdk.haptics.impactOccurred>[0]) =>
    run(() => sdk.haptics.impactOccurred(style)),
};
