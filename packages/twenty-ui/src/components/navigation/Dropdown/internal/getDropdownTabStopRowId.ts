import { isDefined } from '@ui/utilities/utils/isDefined';

export const getDropdownTabStopRowId = ({
  rowIds = [],
  focusedRowId,
}: {
  rowIds?: string[];
  focusedRowId?: string;
}) =>
  isDefined(focusedRowId) && rowIds.includes(focusedRowId)
    ? focusedRowId
    : rowIds[0];
