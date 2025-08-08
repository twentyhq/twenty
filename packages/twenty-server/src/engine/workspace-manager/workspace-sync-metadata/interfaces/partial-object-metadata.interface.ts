import {
  type ComputedPartialFieldMetadata,
  type PartialComputedFieldMetadata,
  type PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type PartialWorkspaceEntity = Pick<
  ObjectMetadataEntity,
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
