import { GUTTER } from './gutter';
import { MAX_CONTENT_WIDTH_PX } from './max-content-width';
import { mediaUp } from './media-up';
import { spacing } from './spacing';

const columnMargin = (gutter: number): string =>
  `max(${spacing(gutter)}, calc((100% - ${MAX_CONTENT_WIDTH_PX}px) / 2 + ${spacing(gutter)}))`;

// Container's width and gutter as margins, for a full-bleed section whose
// own children must still sit on the page column.
export function containerColumnDeclarations(): string {
  return `margin-inline: ${columnMargin(GUTTER.base)};
${mediaUp('md')} { margin-inline: ${columnMargin(GUTTER.md)}; }`;
}
