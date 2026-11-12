import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type FieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/fields-hidden-on-matching-records.type';
import { findRlsRuleFields } from 'src/engine/permissions/internal/field-access/utils/find-rls-rule-fields.util';
import { resolveRelationsInRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-relations-in-record-filter.util';
import { buildRlsRulesRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveFieldsHiddenOnMatchingRecords = async ({
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
}): Promise<FieldsHiddenOnMatchingRecords[]> =>
  Promise.all(
    findRlsRuleFields({
      principals,
      metadataMaps,
      objectMetadataId: flatObjectMetadata.id,
      fieldList,
    }).map(async ({ rowLevelPermissionRule, fieldMetadataIds }) => ({
      fieldMetadataIds,
      recordFilter: await resolveRelationsInRecordFilter({
        recordFilter: buildRlsRulesRecordFilter({
          principals,
          metadataMaps,
          rowLevelPermissionRules: [rowLevelPermissionRule],
        }),
        flatObjectMetadata,
        records,
        metadataMaps,
        findRelationJoinValues,
      }),
    })),
  );
