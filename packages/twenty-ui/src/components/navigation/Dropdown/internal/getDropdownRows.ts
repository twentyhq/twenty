import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRow } from './DropdownRow';
import { type DropdownRowRegistry } from './DropdownRowRegistry';

export const getDropdownRows = (rowRegistry: DropdownRowRegistry) =>
  Array.from(rowRegistry.rows)
    .map(({ elementRef, ...registration }) => ({
      ...registration,
      element: elementRef.current,
    }))
    .filter(
      (row): row is DropdownRow =>
        isDefined(row.element) && row.element.isConnected,
    )
    .sort((firstRow, secondRow) =>
      firstRow.element.compareDocumentPosition(secondRow.element) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );
