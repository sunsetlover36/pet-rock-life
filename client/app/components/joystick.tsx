import { useAtomValue } from 'jotai';
import { Joystick as JoystickComponent } from 'react-joystick-component';
import type { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick';
import { currentPlayerAtom, useGameStore } from '~/store';

export const Joystick = () => {
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const store = useGameStore();

  const handleMove = (event: IJoystickUpdateEvent) => {
    if (currentPlayer) {
      store.updateJoystick(currentPlayer.id, event);
    }
  };
  const handleStop = (event: IJoystickUpdateEvent) => {
    if (currentPlayer) {
      store.updateJoystick(currentPlayer.id, event);
    }
  };

  return (
    <JoystickComponent
      baseColor="#FEC3A6"
      stickColor="#FF928B"
      size={125}
      move={handleMove}
      stop={handleStop}
    />
  );
};
