import { type ObjectLiteral } from 'typeorm';

import {
  type FeatureFlagKey,
  type ObjectsPermissions,
  type RecordGqlOperationFilter,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

export type SqlCondition = { sql: string; parameters: ObjectLiteral };

// The grant paths that admit records for one (object, operation); each is
// compiled to SQL for queries and run in memory for writes and events
export type PermissionsRowAccessGrants = {
  tableAlias: string;
  flatObjectMetadata: FlatObjectMetadata;
  // Role-based grants never reach private records
  areRoleGrantsLimitedToPublicRecords: boolean;
  objectGrant: boolean;
  rlsGrant?: {
    recordFilter: RecordGqlOperationFilter;
    condition: SqlCondition;
  };
  shareGrant?: {
    principalIds: string[];
    accessLevels: RecordShareAccessLevel[];
    isLimitedToPrivateRecords: boolean;
  };
  creatorGrant?: { workspaceMemberId: string };
};

export type RowAccessPolicy =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'gated'; grants: PermissionsRowAccessGrants };

export type RowAccessPolicySubject = {
  isSystemContext: boolean;
  objectsPermissions: ObjectsPermissions | undefined;
  principalIds: string[] | undefined;
  workspaceMemberId: string | undefined;
  isOwningApplication: (objectMetadata: FlatObjectMetadata) => boolean;
  resolveRowLevelPermissionRecordFilter: (
    objectMetadata: FlatObjectMetadata,
  ) => RecordGqlOperationFilter | null;
};

export type RowAccessPolicyEnvironment = {
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
};

export type RowAccessCompilationEnvironment = {
  recordShareTableExpression: string;
};

export type RowAccessPolicyContext = {
  subject: RowAccessPolicySubject;
  environment: RowAccessPolicyEnvironment;
};

export type RowAccessPolicyTarget = {
  tableAlias: string;
  flatObjectMetadata: FlatObjectMetadata;
  operationType: OperationType;
};
