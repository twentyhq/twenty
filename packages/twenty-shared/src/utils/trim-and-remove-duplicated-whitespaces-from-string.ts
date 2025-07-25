const MULTIPLE_WHITESPACE_REGEX = /\s+/g;

export const trimAndRemoveDuplicatedWhitespacesFromString = (str: string) =>
  str.trim().replace(MULTIPLE_WHITESPACE_REGEX, ' ');
