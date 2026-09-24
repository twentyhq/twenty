const SPACE_STUFFED_LINE = /^ (>|From )/;

export const removeSpaceStuffing = (text: string): string =>
  text
    .split('\n')
    .map((line) => (SPACE_STUFFED_LINE.test(line) ? line.slice(1) : line))
    .join('\n');
