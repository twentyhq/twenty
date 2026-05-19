import type { SidebarEntry } from '../types';

import { isFolder } from './is-folder';

export function findContainingFolderId(
  entries: SidebarEntry[],
  label: string,
): string | undefined {
  for (const entry of entries) {
    if (!isFolder(entry)) {
      continue;
    }

    if (
      entry.items.some(
        (item) =>
          item.label === label ||
          item.children?.some((child) => child.label === label) === true,
      )
    ) {
      return entry.id;
    }
  }

  return undefined;
}
