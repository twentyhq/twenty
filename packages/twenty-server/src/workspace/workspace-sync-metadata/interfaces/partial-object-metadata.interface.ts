import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { PartialIndexMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-index-metadata.interface';
import { ReflectObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-object-metadata.interface';

export type PartialObjectMetadata = ReflectObjectMetadata & {
  id?: string;
  workspaceId: string;
  dataSourceId: string;
  fields: PartialFieldMetadata[];
  indexMetadata: PartialIndexMetadata[];
  previousIndexMetadata?: PartialIndexMetadata[];
};
