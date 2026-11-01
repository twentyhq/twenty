import { type ObjectLiteral } from 'typeorm';

import {
  type FeatureFlagKey,
  type ObjectsPermissionsByRoleId,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

export type SqlCondition = { sql: string; parameters: ObjectLiteral };

export type PermissionsMetadataMaps = {
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
};

export type PermissionsRowAccessRequest = {
  principal: PermissionsPrincipal;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  operationType: OperationType;
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
};

export type RowAccessRecord = { id: string } & Record<string, unknown>;

export type RowAccessEvaluationContext = {
  shouldIgnoreSoftDeleteDefaultFilter: boolean;
  fetchRecordShares: (args: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<RecordShareGrant[]>;
  findPrivateRecordStates: (args: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<Map<string, PrivateRecordState>>;
};

export type PermissionsRowAccessEvaluationRequest =
  PermissionsRowAccessRequest & {
    records: RowAccessRecord[];
    context: RowAccessEvaluationContext;
  };

export type PermissionsRowAccessSqlRequest = PermissionsRowAccessRequest & {
  recordShareTableExpression: string;
  tableAlias: string;
};
