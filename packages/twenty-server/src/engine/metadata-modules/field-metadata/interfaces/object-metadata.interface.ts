import { IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { WorkspaceEntityDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/types/workspace-entity-duplicate-criteria.type';

import { FieldMetadataInterface } from './field-metadata.interface';

export interface ObjectMetadataInterface {
  id: string;
  standardId?: string | null;
  workspaceId: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon: string;
  targetTableName: string;
  fields: FieldMetadataInterface[];
  indexMetadatas: IndexMetadataInterface[];
  isSystem: boolean;
  isCustom: boolean;
  isActive: boolean;
  isRemote: boolean;
  isAuditLogged: boolean;
  isSearchable: boolean;
  duplicateCriteria?: WorkspaceEntityDuplicateCriteria[];
  labelIdentifierFieldMetadataId?: string | null;
  imageIdentifierFieldMetadataId?: string | null;
}
