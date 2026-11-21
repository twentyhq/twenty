/* @license Enterprise */

import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupSplitValue } from 'src/engine/permissions/internal/access-group/types/access-group-split-value.type';
import { findAccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/utils/find-access-group-type-handler.util';

export const computeAccessGroupHash = ({
  ruleShapeHash,
  accessGroupSplitValue,
}: {
  ruleShapeHash: string;
  accessGroupSplitValue: AccessGroupSplitValue;
}): string => {
  const splitValue = findAccessGroupTypeHandler(
    accessGroupSplitValue.type,
  ).findSplitValue(accessGroupSplitValue);

  return createHash('sha256')
    .update(
      JSON.stringify([
        accessGroupSplitValue.type,
        ruleShapeHash,
        typeof splitValue === 'string' || !isDefined(splitValue)
          ? splitValue
          : Object.entries(splitValue).sort(([firstKey], [secondKey]) =>
              firstKey.localeCompare(secondKey),
            ),
      ]),
    )
    .digest('hex');
};
