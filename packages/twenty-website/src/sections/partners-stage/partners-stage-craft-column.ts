import { GUTTER, MAX_CONTENT_WIDTH_PX, mediaUp, spacing } from '@/tokens';

// PROTOTYPE (?direction=e): the column every section is framed in, the same
// width and gutter as the site's Container.
export const PARTNERS_STAGE_CRAFT_COLUMN = `
  margin-inline: max(
    ${spacing(GUTTER.base)},
    calc((100% - ${MAX_CONTENT_WIDTH_PX}px) / 2 + ${spacing(GUTTER.base)})
  );

  ${mediaUp('md')} {
    margin-inline: max(
      ${spacing(GUTTER.md)},
      calc((100% - ${MAX_CONTENT_WIDTH_PX}px) / 2 + ${spacing(GUTTER.md)})
    );
  }
`;
