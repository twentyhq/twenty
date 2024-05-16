import {
  ComputedPartialFieldMetadata,
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export type PartialObjectMetadata = Omit<
  ObjectMetadataInterface,
  'id' | 'standardId' | 'fromRelations' | 'toRelations' | 'fields' | 'isActive'
> & {
  standardId: string;
  icon?: string;
  workspaceId: string;
  dataSourceId: string;
  fields: (PartialFieldMetadata | PartialComputedFieldMetadata)[];
};

export type ComputedPartialObjectMetadata = Omit<
  PartialObjectMetadata,
  'standardId' | 'fields'
> & {
  standardId: string | null;
  fields: ComputedPartialFieldMetadata[];
};
