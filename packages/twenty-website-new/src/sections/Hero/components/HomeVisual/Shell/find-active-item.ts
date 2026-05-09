import type { HeroSidebarEntry, HeroSidebarItem } from '@/sections/Hero/types';
import type { HeroPageDefaults } from '../Data/hero-page-defaults';
import { normalizeHeroPage } from '../Data/normalize-hero-page';

import { isFolder } from './is-folder';

function hasRenderablePage(
  item: HeroSidebarItem,
  pageDefaults: HeroPageDefaults,
): boolean {
  return normalizeHeroPage(item, pageDefaults) !== null;
}

export function findActiveItem(
  entries: HeroSidebarEntry[],
  activeLabel: string,
  pageDefaults: HeroPageDefaults,
): HeroSidebarItem | undefined {
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
