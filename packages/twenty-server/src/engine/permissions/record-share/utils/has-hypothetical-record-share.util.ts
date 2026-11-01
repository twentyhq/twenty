/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';

export const hasHypotheticalRecordShare = ({
  operationType,
  hypotheticalRecordShareAccessLevel,
}: Pick<
  PermissionsRowAccessRequest,
  'operationType' | 'hypotheticalRecordShareAccessLevel'
>): boolean =>
  isDefined(hypotheticalRecordShareAccessLevel) &&
  resolveRequiredRecordShareAccessLevels(operationType).includes(
    hypotheticalRecordShareAccessLevel,
  );
