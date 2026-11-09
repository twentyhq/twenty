import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRlsRuleFieldsByRole } from 'src/engine/permissions/internal/masking/utils/find-rls-rule-fields-by-role.util';
import { resolveRelationsInRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-relations-in-record-filter.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveRlsRuleFiltersByRole = async ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  fieldList,
  records,
  findRelationJoinValues,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  fieldList: 'unreadableFields' | 'uneditableFields';
  records: object[];
  findRelationJoinValues: RowAccessEvaluationContext['findRelationJoinValues'];
}): Promise<Map<string, RecordGqlOperationFilter | null>> => {
  const rlsRuleFilterByRoleId = new Map<
    string,
    RecordGqlOperationFilter | null
  >();

  for (const { roleId } of findRlsRuleFieldsByRole({
    principals,
    metadataMaps,
    objectMetadataId: flatObjectMetadata.id,
    fieldList,
  })) {
    const recordFilter = resolveRlsRuleRecordFilter({
      principals,
      metadataMaps,
      flatObjectMetadata,
      roleId,
    });

    rlsRuleFilterByRoleId.set(
      roleId,
      isDefined(recordFilter)
        ? await resolveRelationsInRecordFilter({
            recordFilter,
            flatObjectMetadata,
            records,
            metadataMaps,
            findRelationJoinValues,
          })
        : null,
    );
  }

  return rlsRuleFilterByRoleId;
};
