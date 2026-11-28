import COMPONENT_DOCS from './component-docs.json';
import { pageLabel } from './page-label';

type SectionDoc = (typeof COMPONENT_DOCS.sections)[number];

const isShared = (section: SectionDoc) =>
  section.pages.length > 1 || section.pages.includes('/*');
const sectionOf = (name: string, dir: string) =>
  COMPONENT_DOCS.sections.find(
    (section) => section.name === name && section.dir === dir,
  );

// The sections the way the site reads, for the menu and the index alike:
// shared ones, then each page with its own sections in page order, then the
// unused ones.
export const SECTION_MENU_GROUPS: { title: string; sections: SectionDoc[] }[] =
  [
    {
      title: 'Shared',
      sections: COMPONENT_DOCS.sections
        .filter(isShared)
        .toSorted((first, second) => first.name.localeCompare(second.name)),
    },
    ...COMPONENT_DOCS.pages
      .filter((page) => !page.layout)
      .toSorted((first, second) =>
        first.route === '/' ? -1 : second.route === '/' ? 1 : 0,
      )
      .map((page) => ({
        title: pageLabel(page.route),
        sections: page.sections
          .map((placed) => sectionOf(placed.name, placed.dir))
          .filter(
            (section): section is SectionDoc =>
              section !== undefined && !isShared(section),
          ),
      })),
    {
      title: 'Not used',
      sections: COMPONENT_DOCS.sections.filter(
        (section) => section.pages.length === 0,
      ),
    },
  ].filter((group) => group.sections.length > 0);
