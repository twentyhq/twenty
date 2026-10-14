import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRow } from './DropdownRow';

export const isRovingDropdownRow = ({
  row,
  search,
}: {
  row: Pick<DropdownRow, 'kind' | 'disabled'>;
  search: HTMLInputElement | null;
}) => !row.disabled && (row.kind !== 'back' || !isDefined(search));
