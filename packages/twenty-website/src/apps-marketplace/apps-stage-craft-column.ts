import { mediaUp, spacing } from '@/tokens';

// PROTOTYPE (?direction=e): the 1152px page column every section is framed
// in, with the site gutter as its minimum margin.
export const APPS_STAGE_CRAFT_COLUMN = `
  margin-inline: max(${spacing(4)}, calc((100% - 1152px) / 2));

  ${mediaUp('md')} {
    margin-inline: max(${spacing(10)}, calc((100% - 1152px) / 2));
  }
`;
