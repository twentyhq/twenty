/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';

export const isPermissionsPrincipalOwningObject = ({
  principal,
  flatObjectMetadata,
}: {
  principal: Pick<PermissionsPrincipal, 'applicationId'>;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'applicationId'>;
}): boolean =>
  isDefined(principal.applicationId) &&
  principal.applicationId === flatObjectMetadata.applicationId;
