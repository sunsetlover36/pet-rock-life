import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { Interaction } from "~/components/three";
import { type InteractionData } from "~/types";
import {
  currentPlayerAtom,
  useGameStore,
  modalVisibleAtom,
  modalStateAtom,
} from "~/store";
import { useAtomValue, useSetAtom } from "jotai";
import { greatVillageRockSign } from "~/config/signs";

export const InteractionManager = () => {
  const profile = useAtomValue(currentPlayerAtom);
  const setModalVisible = useSetAtom(modalVisibleAtom);
  const setModalState = useSetAtom(modalStateAtom);

  const interactions = useMemo<InteractionData[]>(
    () => [
      {
        id: "great-rock-interaction",
        position: [-4, 0.1 + 4, -40],
        maxDistance: 6,
        content: <div>Read</div>,
        onInteract: () => {
          setModalState({
            header: "Inscription",
            text: greatVillageRockSign,
          });
          setModalVisible(true);
        },
      },
    ],
    [setModalVisible, setModalState],
  );

  const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(
    new Map(),
  );
  const playerPosition = useRef<Vector3>(new Vector3());

  useFrame(() => {
    if (!profile) return;

    const { position } = useGameStore
      .getState()
      .getPlayerState(profile?.id) ?? {
      position: { x: 0, y: 0, z: 0 },
    };
    const positionVector = new Vector3(position.x, position.y, position.z);
    playerPosition.current.copy(positionVector);

    const newVisibilityMap = new Map(visibilityMap);
    let hasChanges = false;

    interactions.forEach((interaction) => {
      const interactionPos = new Vector3(...interaction.position);
      const distance = positionVector.distanceTo(interactionPos);
      const isCurrentlyVisible = distance <= interaction.maxDistance;
      const wasVisible = visibilityMap.get(interaction.id) || false;

      if (isCurrentlyVisible !== wasVisible) {
        newVisibilityMap.set(interaction.id, isCurrentlyVisible);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setVisibilityMap(newVisibilityMap);
    }
  });

  return (
    <group>
      {interactions.map((interaction) => (
        <Interaction
          key={interaction.id}
          isVisible={visibilityMap.get(interaction.id)}
          {...interaction}
        />
      ))}
    </group>
  );
};

export type { InteractionData };
