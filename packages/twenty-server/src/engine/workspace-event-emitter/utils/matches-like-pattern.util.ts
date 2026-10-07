type LikePatternToken =
  | { kind: 'anyString' }
  | { kind: 'anyCharacter' }
  | { kind: 'character'; character: string };

const LIKE_ESCAPE_CHARACTER = '\\';

const tokenizeLikePattern = (pattern: string): LikePatternToken[] => {
  const characters = Array.from(pattern);
  const tokens: LikePatternToken[] = [];

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];

    if (character === LIKE_ESCAPE_CHARACTER && index + 1 < characters.length) {
      index += 1;
      tokens.push({ kind: 'character', character: characters[index] });
    } else if (character === '%') {
      tokens.push({ kind: 'anyString' });
    } else if (character === '_') {
      tokens.push({ kind: 'anyCharacter' });
    } else {
      tokens.push({ kind: 'character', character });
    }
  }

  return tokens;
};

const tokenMatchesCharacter = (
  token: LikePatternToken | undefined,
  character: string,
): boolean =>
  token?.kind === 'anyCharacter' ||
  (token?.kind === 'character' && token.character === character);

export const matchesLikePattern = ({
  value,
  pattern,
  caseInsensitive,
}: {
  value: string;
  pattern: string;
  caseInsensitive: boolean;
}): boolean => {
  const characters = Array.from(caseInsensitive ? value.toLowerCase() : value);
  const tokens = tokenizeLikePattern(
    caseInsensitive ? pattern.toLowerCase() : pattern,
  );

  let characterIndex = 0;
  let tokenIndex = 0;
  let lastAnyStringTokenIndex = -1;
  let lastAnyStringCharacterIndex = -1;

  while (characterIndex < characters.length) {
    const token: LikePatternToken | undefined = tokens[tokenIndex];

    if (token?.kind === 'anyString') {
      lastAnyStringTokenIndex = tokenIndex;
      lastAnyStringCharacterIndex = characterIndex;
      tokenIndex += 1;
      continue;
    }

    if (tokenMatchesCharacter(token, characters[characterIndex])) {
      tokenIndex += 1;
      characterIndex += 1;
      continue;
    }

    if (lastAnyStringTokenIndex === -1) {
      return false;
    }

    lastAnyStringCharacterIndex += 1;
    characterIndex = lastAnyStringCharacterIndex;
    tokenIndex = lastAnyStringTokenIndex + 1;
  }

  while (tokens[tokenIndex]?.kind === 'anyString') {
    tokenIndex += 1;
  }

  return tokenIndex === tokens.length;
};
