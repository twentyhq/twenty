/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { getPermissionsPrincipalsMainRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-main-role-ids.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { isRelationFieldUnreadableByPrincipals } from 'src/engine/permissions/internal/related-record-path/utils/is-relation-field-unreadable-by-principals.util';
import { omitRlsRulesHidingRelationField } from 'src/engine/permissions/internal/related-record-path/utils/omit-rls-rules-hiding-relation-field.util';

// undefined when the principals cannot read the relation the path starts from
export const buildRelatedRecordPathSourceRequest = <
  TRequest extends Pick<
    PermissionsObjectAccessRequest,
    'principals' | 'metadataMaps' | 'flatObjectMetadata'
  >,
>({
  request,
  resolvedPath: { sourceFlatObjectMetadata, hops },
}: {
  request: TRequest;
  resolvedPath: Pick<
    ResolvedRelatedRecordPath,
    'sourceFlatObjectMetadata' | 'hops'
  >;
}): TRequest | undefined => {
  const { relationFieldMetadataId } = hops[0];
  const sourceRequest = {
    ...request,
    flatObjectMetadata: sourceFlatObjectMetadata,
  };

  if (
    isRelationFieldUnreadableByPrincipals({
      ...sourceRequest,
      relationFieldMetadataId,
    })
  ) {
    return undefined;
  }

  return {
    ...sourceRequest,
    metadataMaps: {
      ...request.metadataMaps,
      rolesPermissions: omitRlsRulesHidingRelationField({
        rolesPermissions: request.metadataMaps.rolesPermissions,
        roleIds: [
          ...getPermissionsPrincipalsMainRoleIds(request.principals),
          ...getPermissionsPrincipalsLimitingRoleIds(request.principals),
        ],
        objectMetadataId: sourceFlatObjectMetadata.id,
        relationFieldMetadataId,
      }),
    },
  };
};
