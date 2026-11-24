export const truncateAiSearchAnswerText = (
  text: string,
  maxCharacters: number,
): string =>
  text.length > maxCharacters ? `${text.slice(0, maxCharacters - 1)}…` : text;
