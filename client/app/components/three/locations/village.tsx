import { type FC } from "react";
import {
  BertHouse,
  Horse,
  Marshmallow,
  Village as VillageModel,
} from "~/components/three/models";
import { Trampoline, GreatVillageRock } from "~/components/three";
import type { LocationProps } from "./types";

export const Village: FC<LocationProps> = ({ position }) => {
  return (
    <group>
      <VillageModel position={position} />

      <Trampoline />
      <GreatVillageRock />
      <Horse />
      <BertHouse />
      <Marshmallow />
    </group>
  );
};
