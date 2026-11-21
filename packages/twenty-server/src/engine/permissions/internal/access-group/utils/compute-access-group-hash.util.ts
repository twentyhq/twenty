/* @license Enterprise */

import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group-type.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

export const computeAccessGroupHash = ({
  type,
  ruleShapeHash,
  splitValue,
}: {
  type: AccessGroupType;
  ruleShapeHash: string;
  splitValue: RlsMemberFieldValues | string | null;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify([
        type,
        ruleShapeHash,
        typeof splitValue === 'string' || !isDefined(splitValue)
          ? splitValue
          : Object.entries(splitValue).sort(([firstKey], [secondKey]) =>
              firstKey.localeCompare(secondKey),
            ),
      ]),
    )
    .digest('hex');
