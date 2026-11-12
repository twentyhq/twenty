/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsActingApplication } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-acting-application.util';

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
  const actingApplication = getPermissionsPrincipalsActingApplication({
    principals,
  });

  return (
    isDefined(actingApplication) &&
    actingApplication.applicationId === flatObjectMetadata.applicationId
  );
};
