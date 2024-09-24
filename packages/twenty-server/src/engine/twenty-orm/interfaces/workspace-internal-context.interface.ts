import { ObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

export interface WorkspaceInternalContext {
  workspaceId: string;
  objectMetadataMap: ObjectMetadataMap;
}
