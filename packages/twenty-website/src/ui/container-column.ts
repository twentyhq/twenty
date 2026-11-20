import { GUTTER, MAX_CONTENT_WIDTH_PX, mediaUp, spacing } from '@/tokens';

// Container's width and gutter as margins, for a full-bleed section whose
// own children must still sit on the page column.
export const CONTAINER_COLUMN = `
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
