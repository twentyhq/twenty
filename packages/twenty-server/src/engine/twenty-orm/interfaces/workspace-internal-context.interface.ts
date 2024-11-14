import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export interface WorkspaceInternalContext {
  workspaceId: string;
  objectMetadataMaps: ObjectMetadataMaps;
}
