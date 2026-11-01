/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isObjectOperationPermitted } from 'src/engine/permissions/role/utils/is-object-operation-permitted.util';

export const isRolePermittingOperation = ({
  subject,
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsRowAccessRequest,
  'subject' | 'flatObjectMetadata' | 'operationType'
>): boolean =>
  !isDefined(subject.objectsPermissions) ||
  isObjectOperationPermitted({
    objectMetadata: flatObjectMetadata,
    operationType,
    objectsPermissions: subject.objectsPermissions,
  });
