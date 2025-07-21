import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import {
  ComputedPartialFieldMetadata,
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

export type PartialWorkspaceEntity = Pick<
  ObjectMetadataInterface,
  | 'workspaceId'
  | 'nameSingular'
  | 'namePlural'
  | 'labelSingular'
  | 'labelPlural'
  | 'description'
  | 'icon'
  | 'targetTableName'
  | 'indexMetadatas'
  | 'isSystem'
  | 'isCustom'
  | 'isRemote'
  | 'isAuditLogged'
  | 'isSearchable'
  | 'duplicateCriteria'
  | 'labelIdentifierFieldMetadataId'
  | 'imageIdentifierFieldMetadataId'
> & {
  standardId: string;
  dataSourceId: string;
  fields: (PartialFieldMetadata | PartialComputedFieldMetadata)[];
};

export type ComputedPartialWorkspaceEntity = Omit<
  PartialWorkspaceEntity,
  'standardId' | 'fields'
> & {
  standardId: string | null;
  fields: ComputedPartialFieldMetadata[];
};
