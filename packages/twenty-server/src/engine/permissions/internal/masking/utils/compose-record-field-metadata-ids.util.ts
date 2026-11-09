import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRlsRuleFieldsByRole } from 'src/engine/permissions/internal/masking/utils/find-rls-rule-fields-by-role.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const composeRecordFieldMetadataIds = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  fieldList,
  objectFieldMetadataIds,
  records,
  rlsRuleFilterByRoleId,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  fieldList: 'unreadableFields' | 'uneditableFields';
  objectFieldMetadataIds: string[];
  records: object[];
  rlsRuleFilterByRoleId: Map<string, RecordGqlOperationFilter | null>;
}): Set<string> => {
  const fieldMetadataIds = new Set(objectFieldMetadataIds);

  for (const rlsRuleFields of findRlsRuleFieldsByRole({
    principals,
    metadataMaps,
    objectMetadataId: flatObjectMetadata.id,
    fieldList,
  })) {
    if (!rlsRuleFilterByRoleId.has(rlsRuleFields.roleId)) {
      rlsRuleFilterByRoleId.set(
        rlsRuleFields.roleId,
        resolveRlsRuleRecordFilter({
          principals,
          metadataMaps,
          flatObjectMetadata,
          roleId: rlsRuleFields.roleId,
        }),
      );
    }

    const rlsRuleFilter = rlsRuleFilterByRoleId.get(rlsRuleFields.roleId) ?? {};

    if (
      records.some((record) =>
        isRecordMatchingFilter({
          record,
          filter: rlsRuleFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter: true,
        }),
      )
    ) {
      for (const fieldMetadataId of rlsRuleFields.fieldMetadataIds) {
        fieldMetadataIds.add(fieldMetadataId);
      }
    }
  }

  return fieldMetadataIds;
};
