import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type UneditableFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/uneditable-fields-on-matching-records.type';
import { findRlsRuleInaccessibleFields } from 'src/engine/permissions/internal/field-access/utils/find-rls-rule-inaccessible-fields.util';
import { resolveInaccessibleFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/utils/resolve-inaccessible-fields-on-matching-records.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveUneditableFieldsOnMatchingRecords = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  records,
  findRelationJoinValues,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  records: object[];
  findRelationJoinValues: RowAccessEvaluationContext['findRelationJoinValues'];
}): Promise<UneditableFieldsOnMatchingRecords[]> =>
  resolveInaccessibleFieldsOnMatchingRecords({
    principals,
    metadataMaps,
    flatObjectMetadata,
    rlsRuleInaccessibleFields: findRlsRuleInaccessibleFields({
      principals,
      metadataMaps,
      objectMetadataId: flatObjectMetadata.id,
      inaccessibleFieldsKey: 'uneditableFields',
    }),
    records,
    findRelationJoinValues,
  });
