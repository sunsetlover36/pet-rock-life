import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { HAT_CONFIGS } from "~/config/hats";
import { SKIN_CONFIGS } from "~/config/skins";
import { cn, getSkinComponent } from "~/config/utils";
import {
  currentPlayerAtom,
  currentScreenAtom,
  previewHatAtom,
  previewSkinAtom,
  clientStore,
} from "~/store";
import { PlayerHat, Screen } from "~/types";
import { Html } from "@react-three/drei";

const MY_STYLE_CAMERA_POSITION = new THREE.Vector3(0, 2, 5);
export const MyStyleCharacter = () => {
  const groupRef = useRef<THREE.Mesh>(null);
  const characterRef = useRef<THREE.Mesh>(null);

  const currentScreen = useAtomValue(currentScreenAtom);
  const player = useAtomValue(currentPlayerAtom);
  const previewSkin = useAtomValue(previewSkinAtom);
  const previewHat = useAtomValue(previewHatAtom);

  const camera = useThree((state) => state.camera);
  const prevCameraState = useRef({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    quaternion: new THREE.Quaternion(),
    up: new THREE.Vector3(),
  });

  useEffect(() => {
    if (prevCameraState.current.position.equals(new THREE.Vector3())) {
      prevCameraState.current.position.copy(camera.position);
      prevCameraState.current.rotation.copy(camera.rotation);
      prevCameraState.current.quaternion.copy(camera.quaternion);
      prevCameraState.current.up.copy(camera.up);
    }

    if (currentScreen === Screen.MY_STYLE && groupRef.current) {
      const target = new THREE.Vector3();
      groupRef.current.getWorldPosition(target);

      camera.position.set(
        MY_STYLE_CAMERA_POSITION.x,
        MY_STYLE_CAMERA_POSITION.y,
        MY_STYLE_CAMERA_POSITION.z,
      );
      camera.lookAt(target);
    } else if (camera.position.equals(MY_STYLE_CAMERA_POSITION)) {
      camera.position.copy(prevCameraState.current.position);
      camera.quaternion.copy(prevCameraState.current.quaternion);
      camera.up.copy(prevCameraState.current.up);
      camera.updateProjectionMatrix();
    }
  }, [currentScreen]);

  useFrame((state, delta) => {
    const currentScreen = clientStore.get(currentScreenAtom);
    if (currentScreen !== Screen.MY_STYLE || !characterRef.current) return;

    const radius = 7.5; // Distance from character
    const speed = 0.4; // Rotation speed
    const height = 2; // Camera height relative to character

    // Get character position
    const characterPosition = new THREE.Vector3();
    characterRef.current.getWorldPosition(characterPosition);

    // Calculate camera position in circular path
    const angle = state.clock.elapsedTime * speed;
    const x = characterPosition.x + Math.cos(angle) * radius;
    const z = characterPosition.z + Math.sin(angle) * radius;
    const y = characterPosition.y + height;

    // Update camera position and look at character
    state.camera.position.set(x, y, z);
    state.camera.lookAt(characterPosition);
  });

  if (currentScreen !== Screen.MY_STYLE) {
    return null;
  }

  const CharacterModel = getSkinComponent(previewSkin);

  const skinConfig = SKIN_CONFIGS[previewSkin];
  const hatConfig = HAT_CONFIGS[previewHat];

  const isStyleChanged = previewHat !== player?.hat;
  const isHatUnlocked = player?.unlockedHats.includes(previewHat);
  const isPaperbagHatUnlocked =
    isHatUnlocked && previewHat === PlayerHat.PAPERBAG_HAT;

  const skinSettings = skinConfig.gameSettings;
  const stylePreview = skinConfig.stylePreview;
  const hatConfigForSkin = Object.assign(
    {},
    hatConfig.skinPositions[previewSkin],
  );

  return (
    <group ref={groupRef} position={[0, 0, 12]}>
      <mesh position={[0, -0.135, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.3, 12]} />
        <meshStandardMaterial color="#643ef6" />
      </mesh>

      <group
        ref={characterRef}
        position={stylePreview.position}
        rotation={[0, Math.PI, 0]}
      >
        <CharacterModel
          hatModelPath={hatConfig.modelPath}
          hatConfig={hatConfigForSkin}
          position={[
            skinSettings.position.x,
            skinSettings.position.y,
            skinSettings.position.z,
          ]}
          isIdle
        />
      </group>

      <Html
        as="div"
        center
        distanceFactor={10}
        zIndexRange={[28, 0]}
        position={[0, 2.5, -0.4]}
      >
        <div
          className={cn(
            "rounded-lg bg-[#FF928B] border-2 px-2 py-1 text-sm text-black w-max text-center",
            isStyleChanged && hatConfig.unlockRequirement ? "block" : "hidden",
          )}
        >
          {isPaperbagHatUnlocked
            ? "Unlocked with love"
            : hatConfig.unlockRequirement}
        </div>
      </Html>
    </group>
  );
};
