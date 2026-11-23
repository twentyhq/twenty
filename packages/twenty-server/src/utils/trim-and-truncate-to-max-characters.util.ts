export const trimAndTruncateToMaxCharacters = ({
  value,
  maxCharacters,
}: {
  value: string;
  maxCharacters: number;
}): string => Array.from(value.trim()).slice(0, maxCharacters).join('');
