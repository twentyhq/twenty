export const normalizeAiSearchAnswerQuestion = (question: string) =>
  question.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
