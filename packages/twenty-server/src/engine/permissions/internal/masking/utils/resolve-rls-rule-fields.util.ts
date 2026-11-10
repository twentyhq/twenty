import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type RlsRuleFields } from 'src/engine/permissions/internal/masking/types/rls-rule-fields.type';
import { findRlsRuleFieldsByRole } from 'src/engine/permissions/internal/masking/utils/find-rls-rule-fields-by-role.util';
import { resolveRelationsInRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-relations-in-record-filter.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveRlsRuleFields = async ({
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
}): Promise<RlsRuleFields[]> =>
  Promise.all(
    findRlsRuleFieldsByRole({
      principals,
      metadataMaps,
      objectMetadataId: flatObjectMetadata.id,
      fieldList,
    }).map(async ({ roleId, fieldMetadataIds }) => {
      const recordFilter = resolveRlsRuleRecordFilter({
        principals,
        metadataMaps,
        flatObjectMetadata,
        roleId,
      });

      return {
        roleId,
        fieldMetadataIds,
        recordFilter: isDefined(recordFilter)
          ? await resolveRelationsInRecordFilter({
              recordFilter,
              flatObjectMetadata,
              records,
              metadataMaps,
              findRelationJoinValues,
            })
          : null,
      };
    }),
  );
