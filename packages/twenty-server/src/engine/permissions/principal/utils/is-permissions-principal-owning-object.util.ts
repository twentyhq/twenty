/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { resolvePermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/resolve-permissions-principal-acting-application-id.util';

export const isPermissionsPrincipalOwningObject = ({
  principal,
  flatApplicationMaps,
  flatObjectMetadata,
}: {
  principal: Pick<PermissionsPrincipal, 'intersectionOf'>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'applicationId'>;
}): boolean =>
  isDefined(flatObjectMetadata.applicationId) &&
  resolvePermissionsPrincipalActingApplicationId({
    intersectionOf: principal.intersectionOf,
    flatApplicationMaps,
  }) === flatObjectMetadata.applicationId;
