// A text's first sentence: what an app says about itself under its name,
// on its page and on its card alike.
export const leadSentence = (text: string) =>
  text.trim().split(/(?<=[.!?])\s/)[0] ?? '';
