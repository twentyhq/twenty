const BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN = /\\\\"$/;
const UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE = '\\u005c"';

export const printConditionalAvailabilityText = ({
  text,
}: {
  text: string;
}): string =>
  JSON.stringify(text).replace(
    BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN,
    UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE,
  );
