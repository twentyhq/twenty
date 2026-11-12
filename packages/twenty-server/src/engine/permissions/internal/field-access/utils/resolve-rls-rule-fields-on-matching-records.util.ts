import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { resolveRelationsInRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-relations-in-record-filter.util';
import { buildRlsRulesRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveRlsRuleFieldsOnMatchingRecords = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  rlsRuleFields,
  records,
  findRelationJoinValues,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  rlsRuleFields: {
    rowLevelPermissionRule: RlsRule;
    fieldMetadataIds: string[];
  }[];
  records: object[];
  findRelationJoinValues: RowAccessEvaluationContext['findRelationJoinValues'];
}): Promise<
  { fieldMetadataIds: string[]; recordFilter: RecordGqlOperationFilter }[]
> =>
  Promise.all(
    rlsRuleFields.map(async ({ rowLevelPermissionRule, fieldMetadataIds }) => ({
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
