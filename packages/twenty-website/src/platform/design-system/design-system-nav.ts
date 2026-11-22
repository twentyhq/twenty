import COMPONENT_DOCS from './component-docs.json';
import { toComponentSlug } from './component-slug';
import { type DesignSystemTab } from './design-system-tabs';
import { FOUNDATION_TOPICS } from './foundation-topics';
import { toPageSlug } from './page-slug';
import { humanName } from './human-name';
import { pageLabel } from './page-label';
import { SECTION_MENU_GROUPS } from './section-menu-groups';

export type NavLink = { href: string; label: string };
export type NavGroup = {
  title: string;
  items: NavLink[];
  subgroups?: NavGroup[];
};

const linksOfKind = (...kinds: string[]) =>
  COMPONENT_DOCS.components
    .filter((component) => kinds.includes(component.kind))
    .map((component) => ({
      href: `/design-system/components/${toComponentSlug(component.name)}`,
      label: component.name,
    }))
    .toSorted((first, second) => first.label.localeCompare(second.label));

// Grouped by the kind the generator reads from the code; every page still
// shows where the component really lives (all of them are in src/ui).
const COMPONENTS_NAV = [
  {
    title: 'Foundations',
    items: FOUNDATION_TOPICS.map((topic) => ({
      href: `/design-system/foundations/${topic.slug}`,
      label: topic.label,
    })),
  },
  {
    title: 'Components',
    items: [{ href: '/design-system/gallery', label: 'All on one page' }],
    subgroups: [
      { title: 'Elements', items: linksOfKind('component') },
      { title: 'Sections', items: linksOfKind('section') },
      { title: 'Layout', items: linksOfKind('layout') },
      { title: 'Building blocks', items: linksOfKind('internal', 'decor') },
    ],
  },
];

const SECTIONS_NAV: NavGroup[] = [
  {
    title: 'Sections',
    items: [{ href: '/design-system/sections', label: 'All sections' }],
  },
  ...SECTION_MENU_GROUPS.map((group) => ({
    title: group.title,
    items: group.sections.map((section) => ({
      href: `/design-system/sections/${toComponentSlug(section.name)}`,
      label: humanName(section.name),
    })),
  })),
];

const PAGES_NAV = [
  {
    title: 'Pages',
    items: [
      { href: '/design-system/pages', label: 'All pages' },
      ...COMPONENT_DOCS.pages.map((page) => ({
        href: `/design-system/pages/${toPageSlug(page.route)}`,
        label: pageLabel(page.route),
      })),
    ],
  },
];

const NAV_BY_TAB: Record<DesignSystemTab, NavGroup[]> = {
  components: COMPONENTS_NAV,
  sections: SECTIONS_NAV,
  pages: PAGES_NAV,
};

const tabOf = (current?: string): DesignSystemTab =>
  current?.startsWith('/design-system/sections')
    ? 'sections'
    : current?.startsWith('/design-system/pages')
      ? 'pages'
      : 'components';

// Every page in navigation order, for the previous and next links.
const flatten = (groups: NavGroup[]): NavLink[] =>
  groups.flatMap((group) => [
    ...group.items,
    ...flatten(group.subgroups ?? []),
  ]);
const PAGE_ORDER: Record<DesignSystemTab, NavLink[]> = {
  components: [
    { href: '/design-system', label: 'Overview' },
    ...flatten(COMPONENTS_NAV),
  ],
  sections: flatten(SECTIONS_NAV),
  pages: flatten(PAGES_NAV),
};

// The sidebar of each tab, the reading order for previous and next, and the
// tab a path belongs to.
export const DESIGN_SYSTEM_NAV = {
  byTab: NAV_BY_TAB,
  pageOrder: PAGE_ORDER,
  tabOf,
};
