import type { SidebarEntry, SidebarItemDef } from '../types';
import type { PageDefaults } from '../Data/page-defaults';
import { normalizePage } from '../Data/normalize-page';

import { isFolder } from './is-folder';

function hasRenderablePage(
  item: SidebarItemDef,
  pageDefaults: PageDefaults,
): boolean {
  return normalizePage(item, pageDefaults) !== null;
}

export function findActiveItem(
  entries: SidebarEntry[],
  activeLabel: string,
  pageDefaults: PageDefaults,
): SidebarItemDef | undefined {
  for (const entry of entries) {
    if (isFolder(entry)) {
      for (const child of entry.items) {
        if (child.label === activeLabel) {
          return child;
        }
      }

      continue;
    }

    if (entry.children) {
      for (const child of entry.children) {
        if (child.label === activeLabel) {
          return child;
        }
      }
    }

    if (entry.label === activeLabel) {
      if (
        !hasRenderablePage(entry, pageDefaults) &&
        entry.children &&
        entry.children.length > 0
      ) {
        const firstChildWithRenderablePage = entry.children.find((child) =>
          hasRenderablePage(child, pageDefaults),
        );

        if (firstChildWithRenderablePage) {
          return firstChildWithRenderablePage;
        }
      }

      return entry;
    }
  }

  return undefined;
}
