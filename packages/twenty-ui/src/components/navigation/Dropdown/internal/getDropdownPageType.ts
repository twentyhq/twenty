import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRegistry } from './DropdownRegistry';

export const getDropdownPageType = ({
  registry,
  pageId,
}: {
  registry: DropdownRegistry;
  pageId?: string;
}) =>
  Array.from(registry.pages).find(
    (page) =>
      page.id === pageId &&
      isDefined(page.elementRef.current) &&
      page.elementRef.current.isConnected,
  )?.type;
