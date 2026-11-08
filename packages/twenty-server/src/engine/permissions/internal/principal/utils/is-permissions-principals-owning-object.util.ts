/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsActingApplicationId } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-acting-application-id.util';

export const isPermissionsPrincipalsOwningObject = ({
  principals,
  flatObjectMetadata,
}: {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'applicationId'>;
}): boolean => {
  const actingApplicationId = getPermissionsPrincipalsActingApplicationId({
    principals,
  });

  return (
    isDefined(actingApplicationId) &&
    actingApplicationId === flatObjectMetadata.applicationId
  );
};
