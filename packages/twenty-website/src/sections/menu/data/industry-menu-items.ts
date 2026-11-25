import { INDUSTRY_PAGES } from '@/industries';

import { type MenuNavChild } from '../types/menu-nav-child';

export const INDUSTRY_MENU_ITEMS: readonly MenuNavChild[] =
  INDUSTRY_PAGES.flatMap((page) => {
    if (page.kind !== 'category') {
      return [];
    }

    return [
      {
        label: page.name,
        description: page.menu.description,
        href: `/solutions/${page.slug}`,
        icon: page.menu.icon,
        preview: {
          kind: 'links',
          title: page.name,
          description: page.meta.description,
          links: INDUSTRY_PAGES.filter(
            (candidate) =>
              candidate.kind === 'subCategory' &&
              candidate.parentSlug === page.slug,
          ).map((subCategory) => ({
            label: subCategory.name,
            href: `/solutions/${subCategory.slug}`,
          })),
        },
      },
    ];
  });
