/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getPermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/get-permissions-principal-acting-application-id.util';

export const isPermissionsPrincipalOwningObject = ({
  principal,
  flatObjectMetadata,
  flatApplicationMaps,
}: {
  principal: Omit<PermissionsPrincipal, 'workspaceId'>;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'applicationId'>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): boolean => {
  const actingApplicationId = getPermissionsPrincipalActingApplicationId({
    principal,
    flatApplicationMaps,
  });

  return (
    isDefined(actingApplicationId) &&
    actingApplicationId === flatObjectMetadata.applicationId
  );
};
