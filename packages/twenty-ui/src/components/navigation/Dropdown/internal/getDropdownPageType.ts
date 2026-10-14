import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRowRegistry } from './DropdownRowRegistry';

export const getDropdownPageType = ({
  rowRegistry,
  pageId,
}: {
  rowRegistry: DropdownRowRegistry;
  pageId?: string;
}) =>
  Array.from(rowRegistry.pages).find(
    (page) =>
      page.id === pageId &&
      isDefined(page.elementRef.current) &&
      page.elementRef.current.isConnected,
  )?.type;
