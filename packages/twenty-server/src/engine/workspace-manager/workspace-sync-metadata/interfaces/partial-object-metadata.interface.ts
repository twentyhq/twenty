import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import {
  ComputedPartialFieldMetadata,
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

export type PartialWorkspaceEntity = Omit<
  ObjectMetadataInterface,
  'id' | 'standardId' | 'fromRelations' | 'toRelations' | 'fields' | 'isActive'
> & {
  standardId: string;
  icon?: string;
  workspaceId: string;
  dataSourceId: string;
  fields: (PartialFieldMetadata | PartialComputedFieldMetadata)[];
  labelIdentifierStandardId?: string | null;
  imageIdentifierStandardId?: string | null;
};

export type ComputedPartialWorkspaceEntity = Omit<
  PartialWorkspaceEntity,
  'standardId' | 'fields'
> & {
  standardId: string | null;
  fields: ComputedPartialFieldMetadata[];
};
