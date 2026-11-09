import {
  type FeatureFlagKey,
  type RecordShareAccessLevel,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/internal/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { type RecordShareGrant } from 'src/engine/permissions/internal/record-share/types/record-share-grant.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export type PermissionsMetadataMaps = {
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatWorkspaceMemberMaps?: FlatWorkspaceMemberMaps;
};

export type PermissionsRowAccessRequest = {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  operationType: ObjectRecordsOperationType;
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
};

export type PermissionsObjectAccessRequest = Pick<
  PermissionsRowAccessRequest,
  'principals' | 'metadataMaps' | 'flatObjectMetadata' | 'operationType'
>;

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
  findRelationJoinValues: (args: {
    targetFlatObjectMetadata: FlatObjectMetadata;
    targetColumnName: string;
    tableAlias: string;
    condition: SqlCondition | null;
    joinValues: string[];
  }) => Promise<string[]>;
};

export type PermissionsRowAccessEvaluationRequest =
  PermissionsRowAccessRequest & {
    records: RowAccessRecord[];
    context: RowAccessEvaluationContext;
  };

export type PermissionsRowAccessSqlRequest = PermissionsRowAccessRequest & {
  recordShareTableExpression: string;
  tableAlias: string;
  callerAccessGroupCompactIds?: number[];
};
