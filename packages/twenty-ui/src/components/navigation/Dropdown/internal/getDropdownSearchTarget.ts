import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownType } from '../types/DropdownType';
import { type DropdownRow } from './DropdownRow';

export const getDropdownSearchTarget = ({
  enabledRows,
  search,
  type,
}: {
  enabledRows: DropdownRow[];
  search: HTMLInputElement | null;
  type: DropdownType;
}) => {
  if (
    type === 'panel' ||
    !isDefined(search) ||
    !isNonEmptyString(search.value.trim())
  ) {
    return undefined;
  }

  return enabledRows.find((row) => row.kind === 'option');
};
