import { CustomError } from '@/utils/errors/CustomError';
import escapeRegExp from 'lodash.escaperegexp';

export const convertLikePatternToRegexOrThrow = ({
  pattern,
  isCaseInsensitive = false,
}: {
  pattern: string;
  isCaseInsensitive?: boolean;
}): RegExp => {
  const regexPattern = pattern.replace(/\\[\s\S]|[\s\S]/gu, (character) => {
    if (character === '\\') {
      throw new CustomError(
        'LIKE pattern must not end with escape character',
        'INVALID_LIKE_PATTERN',
      );
    }

    if (character.startsWith('\\')) {
      return escapeRegExp(character.slice(1));
    }

    if (character === '%') {
      return '[\\s\\S]*';
    }

    if (character === '_') {
      // Match a code point without the extra case folding introduced by the iu flags.
      return '(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[^\\uD800-\\uDFFF])';
    }

    return escapeRegExp(character);
  });

  return new RegExp(`^${regexPattern}$`, isCaseInsensitive ? 'i' : '');
};
