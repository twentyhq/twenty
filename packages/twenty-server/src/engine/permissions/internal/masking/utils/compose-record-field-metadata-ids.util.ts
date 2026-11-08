import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRlsRuleFieldsByRole } from 'src/engine/permissions/internal/masking/utils/find-rls-rule-fields-by-role.util';
import { resolveRowLevelPermissionRecordFilterForRole } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-record-filter-for-role.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

// Object level lists apply to every record, and an RLS rule's list adds up on the records it matches
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
        resolveRowLevelPermissionRecordFilterForRole({
          principals,
          metadataMaps,
          flatObjectMetadata,
          roleId: rlsRuleFields.roleId,
        }),
      );
    }

    const rlsRuleFilter = rlsRuleFilterByRoleId.get(rlsRuleFields.roleId);

    if (
      isDefined(rlsRuleFilter) &&
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
