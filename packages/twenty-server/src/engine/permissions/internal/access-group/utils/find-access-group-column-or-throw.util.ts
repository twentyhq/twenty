/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';

export const findAccessGroupColumnOrThrow = <TValue>({
  compactId,
  value,
}: {
  compactId: number;
  value: TValue | null;
}): TValue => {
  if (!isDefined(value)) {
    throw new PermissionsException(
      `Access group ${compactId} does not have the columns of its type`,
      PermissionsExceptionCode.RECORD_PERMISSION_QUERY_FAILED,
    );
  }

  return value;
};
