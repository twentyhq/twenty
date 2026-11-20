/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

export type AccessGroupFamilyKeyRelationHop = {
  targetFlatObjectMetadata: FlatObjectMetadata;
  sourceColumnName: string;
  targetColumnName: string;
};

export type AccessGroupFamilyKey = {
  memberFieldKey: string;
  columnName: string;
  relationHop: AccessGroupFamilyKeyRelationHop | null;
};

export type AccessGroupFamily = {
  roleId: string;
  objectMetadataId: string;
  ruleId: string;
  keys: AccessGroupFamilyKey[];
  residualRule: RlsRule;
};
