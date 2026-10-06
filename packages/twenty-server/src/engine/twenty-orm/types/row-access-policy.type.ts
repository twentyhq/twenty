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
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceRelationShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type SqlCondition = { sql: string; parameters: ObjectLiteral };

// One description of who may access which rows, compiled to SQL for queries
// and evaluated on records in memory for writes and events, so both always
// decide the same way
export type RowAccessExpression =
  | { kind: 'and'; operands: RowAccessExpression[] }
  | { kind: 'or'; operands: RowAccessExpression[] }
  | {
      kind: 'roleFilter';
      tableAlias: string;
      flatObjectMetadata: FlatObjectMetadata;
      recordFilter: RecordGqlOperationFilter;
      condition: SqlCondition;
    }
  | ({
      kind: 'recordShared';
      // Compiled as a grant list read once, so it can be ORed with an indexed filter
      isUncorrelated?: boolean;
    } & RecordShareExpressionTarget)
  | ({ kind: 'recordNotRestricted' } & RecordShareExpressionTarget)
  | ({
      kind: 'inheritedReadability';
      parents: InheritedReadabilityParentExpression[];
      isOpenWhenDetached: boolean;
    } & RecordShareExpressionTarget);

export type RecordShareExpressionTarget = {
  tableAlias: string;
  objectMetadataId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
};

export type InheritedReadabilityParentExpression =
  | {
      kind: 'column';
      joinColumnName: string;
      parentTableAlias: string;
      parentFlatObjectMetadata: FlatObjectMetadata;
      policy: RowAccessPolicy;
    }
  | {
      kind: 'children';
      childTableAlias: string;
      childJoinColumnName: string;
      childFlatObjectMetadata: FlatObjectMetadata;
      policy: RowAccessPolicy;
    };

export type RowAccessPolicy =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'gated'; expression: RowAccessExpression };

export type CompiledRowAccessPolicy =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'gated'; condition: SqlCondition };

export type RowAccessPolicySubject = {
  isSystemContext: boolean;
  objectsPermissions: ObjectsPermissions | undefined;
  principalIds: string[] | undefined;
  canAccessAllRecords: boolean;
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
  resolveTableExpression: (objectMetadataId: string) => string;
};

export type RowAccessPolicyContext = {
  subject: RowAccessPolicySubject;
  environment: RowAccessPolicyEnvironment;
};

export type RowAccessPolicyTarget = {
  tableAlias: string;
  flatObjectMetadata: FlatObjectMetadata;
  operationType: OperationType;
  depth: number;
  joinParentRelationShape?: WorkspaceRelationShape;
};
