// No line breaks or unbalanced brackets, so an unclosed reference can't swallow the text after it; a name may hold balanced [..] pairs.
export const CHAT_REFERENCE_BODY_PATTERN =
  '(?:[^\\[\\]\\n\\r]|\\[[^\\[\\]\\n\\r]*\\])*';
