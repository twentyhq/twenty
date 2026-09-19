export type AiClassificationResult = {
  category: string;
  // Generative classifiers do not supply calibrated probabilities.
  probability: number | null;
  probabilities: { category: string; probability: number }[] | null;
  modelId: string;
  resolvedModelId: string;
  usage: { inputTokens: number; outputTokens: number };
};
