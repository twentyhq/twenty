/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsPermission,
  isDefined,
  canRlsRuleAccessOperation,
} from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { buildMemberFieldValuesOrThrow } from 'src/engine/permissions/internal/rls/utils/build-member-field-values-or-throw.util';
import {
  buildRlsRecordFilter,
  type RlsRule,
} from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { resolveRlsWorkspaceMember } from 'src/engine/permissions/internal/rls/utils/resolve-rls-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

type ResolveRlsRuleRecordFilterArgs = {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
};

export const buildRlsRulesRecordFilter = ({
  principals,
  metadataMaps,
  rowLevelPermissionRules,
}: Omit<ResolveRlsRuleRecordFilterArgs, 'flatObjectMetadata'> & {
  rowLevelPermissionRules: RlsRule[];
}): RecordGqlOperationFilter => {
  const workspaceMember = resolveRlsWorkspaceMember({
    principals,
    metadataMaps,
  });

  return buildRlsRecordFilter({
    rowLevelPermissionRules,
    memberFieldValues: buildMemberFieldValuesOrThrow({
      workspaceMember,
      predicates: rowLevelPermissionRules.flatMap(
        ({ predicates }) => predicates,
      ),
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    }),
    currentWorkspaceMemberId: workspaceMember?.id,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    isRelationHopEnabled: isRlsRelationHopEnabled(metadataMaps.featureFlagsMap),
  });
};

export const resolveRlsRuleRecordFilter = ({
  operationType,
  ...args
}: ResolveRlsRuleRecordFilterArgs & {
  operationType: ObjectRecordsOperationType;
}): RecordGqlOperationFilter | null => {
  const objectRecordsPermissions =
    getPermissionsPrincipalsRecordsPermissions(args).objects[
      args.flatObjectMetadata.id
    ];
  const enforcedOperationType = getEnforcedOperationType({
    operationType,
    featureFlagsMap: args.metadataMaps.featureFlagsMap,
  });

  if (
    !isDefined(objectRecordsPermissions?.rowLevelRecordsPermissions) ||
    canAccessThroughAllRecordsPermission({
      objectRecordsPermissions,
      operationType: enforcedOperationType,
    })
  ) {
    return null;
  }

  return buildRlsRulesRecordFilter({
    ...args,
    rowLevelPermissionRules:
      objectRecordsPermissions.rowLevelRecordsPermissions.filter((rule) =>
        canRlsRuleAccessOperation({
          rule,
          operationType: enforcedOperationType,
        }),
      ),
  });
};
