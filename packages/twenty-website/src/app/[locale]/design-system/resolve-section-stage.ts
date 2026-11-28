import { resolvePagePreview } from './resolve-page-preview';
import { SECTION_PREVIEWS } from './section-previews';

// How a section can be shown: alone when it needs nothing, else inside the
// first page with a fixed URL that places it, else not at all.
export const resolveSectionStage = async (section: {
  name: string;
  dir: string;
  pages: string[];
}) => {
  const key = `${section.dir}/${section.name}`;
  if (SECTION_PREVIEWS[key]) return { mode: 'alone' as const, key };
  const targets = await Promise.all(
    section.pages.map((route) => resolvePagePreview(route)),
  );
  const index = targets.findIndex((target) => target !== null);
  const target = index >= 0 ? targets[index] : null;
  return target
    ? {
        mode: 'page' as const,
        key,
        route: section.pages[index],
        url: target.url,
        params: target.params,
      }
    : { mode: 'none' as const, key };
};
