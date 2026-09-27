import { type ObjectLiteral } from 'typeorm';

import {
  type ObjectsPermissions,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type WorkspaceRelationShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type SqlCondition = { sql: string; parameters: ObjectLiteral };

export type RowAccessPolicy =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'gated'; condition: SqlCondition };

export type RowAccessPolicySubject = {
  isSystemContext: boolean;
  objectsPermissions: ObjectsPermissions | undefined;
  principalIds: string[] | undefined;
  isOwningApplication: (objectMetadata: FlatObjectMetadata) => boolean;
  resolveRowLevelPermissionRecordFilter: (
    objectMetadata: FlatObjectMetadata,
  ) => RecordGqlOperationFilter | null;
};

export type RowAccessPolicyEnvironment = {
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
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
