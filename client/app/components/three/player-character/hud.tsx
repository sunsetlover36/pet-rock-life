import type { FC } from "react";
import { PlayerMessages } from "./player-messages";
import { UIMode, type PlayerProfile } from "~/types";
import { Html } from "@react-three/drei";
import { useAtomValue } from "jotai";
import { uiModeAtom } from "~/store";
import { SKIN_CONFIGS } from "~/config/skins";

interface HudProps {
  profile: PlayerProfile;
}
// FIXME: Two separate HTML + re-render
export const Hud: FC<HudProps> = ({ profile }) => {
  const uiMode = useAtomValue(uiModeAtom);

  const hudConfig = SKIN_CONFIGS[profile.skin].hudSettings;
  return uiMode === UIMode.GAMEPLAY ? (
    <>
      <PlayerMessages profile={profile} />
      <Html
        position={hudConfig.namePosition}
        center
        zIndexRange={[30, 0]}
        distanceFactor={10}
      >
        <div className="font-bold whitespace-nowrap text-center hud">
          {profile?.tag && (
            <span
              className="text-black text-sm font-bold rounded-lg px-1 py-0.5 mr-0.5"
              style={{
                backgroundColor: profile.tag.color,
              }}
            >
              {profile.tag.text}
            </span>
          )}
          <span className="text-black bg-white px-1 py-0.5 text-sm rounded-lg">
            {profile?.username}
          </span>
        </div>
      </Html>
    </>
  ) : null;
};
