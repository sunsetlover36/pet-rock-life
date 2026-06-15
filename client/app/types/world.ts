import type {
  Area,
  AreaMetadata,
  Interior,
  InteriorMetadata,
  SignMetadata,
} from "./location";

export interface WorldMetadata {
  areas: Record<Area, AreaMetadata>;
  interiors: Record<Interior, InteriorMetadata>;
  signs: SignMetadata[];
}
