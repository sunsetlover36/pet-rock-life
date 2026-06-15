import { useGameStore } from "~/store";
import type { WebSocketManager } from "./socket";
import type { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";

export class TeleportationManager {
  private static playerRef: React.RefObject<any> | null = null;
  private static rockRef: React.RefObject<any> | null = null;
  private static playerId: string = "";
  private static wsManager: WebSocketManager | null = null;
  private static settleToken = 0;

  static setRefs(
    playerRef: React.RefObject<any>,
    rockRef: React.RefObject<any>,
    playerId: string,
    wsManager?: WebSocketManager | null,
  ) {
    this.playerRef = playerRef;
    this.rockRef = rockRef;
    this.playerId = playerId;
    this.wsManager = wsManager || null;
  }

  static teleportPlayer(destination: [number, number, number]) {
    if (!this.playerRef?.current || !this.rockRef?.current || !this.playerId) {
      console.warn("Player or rock ref not available for teleportation");
      return;
    }

    const playerBody = this.playerRef.current;
    const rockBody = this.rockRef.current;
    const wsManager = this.wsManager;
    const [x, y, z] = destination;
    const rockPosition = { x: x + 2, y: y + 1, z };
    const stoppedJoystick: IJoystickUpdateEvent = {
      type: "stop",
      x: 0,
      y: 0,
      distance: null,
      direction: null,
    };

    const applyTeleport = () => {
      playerBody.setTranslation({ x, y, z }, true);
      playerBody.setLinvel?.({ x: 0, y: 0, z: 0 }, true);
      playerBody.setAngvel?.({ x: 0, y: 0, z: 0 }, true);

      rockBody.setTranslation(rockPosition, true);
      rockBody.setLinvel?.({ x: 0, y: 0, z: 0 }, true);
      rockBody.setAngvel?.({ x: 0, y: 0, z: 0 }, true);
    };

    applyTeleport();

    // Update game store
    const gameStore = useGameStore.getState();
    gameStore.updatePlayerState(this.playerId, {
      position: { x, y, z },
      rotation: playerBody.rotation(),
      rockPosition,
      rockRotation: rockBody.rotation(),
      joystick: stoppedJoystick,
    });

    const sendTeleportPosition = () => {
      if (!wsManager) return;

      wsManager.updatePosition(
        {
          position: { x, y, z },
          rotation: {
            x: playerBody.rotation().x,
            y: playerBody.rotation().y,
            z: playerBody.rotation().z,
            w: playerBody.rotation().w,
          },
          rockPosition,
          rockRotation: {
            x: rockBody.rotation().x,
            y: rockBody.rotation().y,
            z: rockBody.rotation().z,
            w: rockBody.rotation().w,
          },
          joystick: stoppedJoystick,
        },
        { force: true },
      );
    };

    // Block normal movement packets briefly while Rapier settles around the new island.
    wsManager?.suppressPositionUpdates(140);
    sendTeleportPosition();

    const token = ++this.settleToken;
    const settleUntil = performance.now() + 120;
    const settle = () => {
      if (token !== this.settleToken) return;

      applyTeleport();
      if (performance.now() < settleUntil) {
        requestAnimationFrame(settle);
        return;
      }

      sendTeleportPosition();
    };

    requestAnimationFrame(settle);

    console.log(`Teleported to position [${x}, ${y}, ${z}]`);
  }
}
