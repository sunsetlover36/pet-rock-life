export enum Area {
  VILLAGE = "village",
  KITTY_HOLLOW = "kitty_hollow",
}
export enum Interior {
  BAR = "bar",
  TOWN_HALL = "town_hall",
}

export interface SignMetadata {
  id: string;
  text: string;
  fontSize?: number;
  position: [number, number, number];
  rotation: [number, number, number];
  withStand?: boolean;
}

export interface AreaMetadata {
  name: string;
  description: string;
  position: [number, number, number];
  spawnPosition: [number, number, number];
  interiors: Interior[];
}
export interface InteriorMetadata {
  name: string;
  description: string;
  position: [number, number, number];
  entrancePosition: [number, number, number];
  exitPosition: [number, number, number];
  pickups: Record<string, [number, number, number]>;
  parentArea: Area;
}

export interface PlayerLocation {
  area: Area;
  interior: Interior | null;
}
