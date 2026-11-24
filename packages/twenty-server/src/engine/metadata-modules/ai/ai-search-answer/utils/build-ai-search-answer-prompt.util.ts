export const buildAiSearchAnswerPrompt = ({
  question,
  serializedEvidence,
}: {
  question: string;
  serializedEvidence: string;
}): string =>
  `Question: ${JSON.stringify(question)}\n\nRecords:\n${serializedEvidence}`;
