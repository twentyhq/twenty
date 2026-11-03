import { type RecordSharePrincipalType } from 'twenty-shared/types';

import {
  type PermissionsMetadataMaps,
  type PermissionsRowAccessEvaluationRequest,
  type PermissionsRowAccessSqlRequest,
  type RowAccessRecord,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceRelationShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type ObjectRowAccessPolicy = {
  objectUniversalIdentifiers: string[];
  buildCondition: (
    request: PermissionsRowAccessSqlRequest,
  ) => SqlCondition | false | undefined;
  findAdmittedRecordIds: (
    request: PermissionsRowAccessEvaluationRequest,
  ) => Promise<Set<string>>;
  validateWritesOrThrow: (
    request: PermissionsRowAccessEvaluationRequest & {
      recordsBefore: RowAccessRecord[];
      targetRelations: WorkspaceRelationShape[];
      findReadableRecordIds: (args: {
        objectMetadataId: string;
        recordIds: string[];
      }) => Promise<Set<string>>;
    },
  ) => Promise<void>;
  validateSharingOrThrow: (request: {
    transactionScope: WorkspaceTransactionScope;
    flatObjectMetadata: FlatObjectMetadata;
    metadataMaps: Pick<
      PermissionsMetadataMaps,
      'featureFlagsMap' | 'flatFieldMetadataMaps'
    >;
    recordIds: string[];
    principals?: {
      principalId: string;
      principalType: RecordSharePrincipalType;
    }[];
    isPrivate?: boolean;
  }) => Promise<void>;
};
