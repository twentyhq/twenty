import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export interface WorkspaceInternalContext {
  workspaceId: string;
  objectMetadataCollection: ObjectMetadataEntity[];
}
