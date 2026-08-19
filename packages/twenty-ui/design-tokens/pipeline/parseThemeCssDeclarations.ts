// Parses the base .light{}/.dark{} block of a generated theme CSS file into
// ordered declarations, joining formatter-wrapped values back to one line.
export const parseThemeCssDeclarations = (
  css: string,
  scheme: 'light' | 'dark',
): { name: string; value: string }[] => {
  const lines = css.split('\n');
  const openIndex = lines.indexOf(`.${scheme} {`);
  if (openIndex === -1) {
    throw new Error(`Missing top-level .${scheme} block`);
  }
  const closeIndex = lines.indexOf('}', openIndex);
  if (closeIndex === -1) {
    throw new Error(`Unterminated .${scheme} block`);
  }

  const declarations: { name: string; value: string }[] = [];
  let pendingFragments: string[] = [];
  for (const line of lines.slice(openIndex + 1, closeIndex)) {
    const trimmed = line.trim();
    if (trimmed === '') {
      continue;
    }
    pendingFragments.push(trimmed);
    if (!trimmed.endsWith(';')) {
      continue;
    }
    const joined = pendingFragments
      .join(' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
    pendingFragments = [];
    const colonIndex = joined.indexOf(':');
    declarations.push({
      name: joined.slice(0, colonIndex).trim(),
      value: joined.slice(colonIndex + 1, -1).trim(),
    });
  }
  if (pendingFragments.length > 0) {
    throw new Error(
      `Unterminated declaration in .${scheme} block: ${pendingFragments[0]}`,
    );
  }
  return declarations;
};
