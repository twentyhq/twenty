import { type TranscriptionModel } from 'ai';

type TranscriptionCapableProvider = {
  transcription: (modelId: string) => TranscriptionModel;
};

const hasTranscriptionFactory = (
  provider: unknown,
): provider is TranscriptionCapableProvider =>
  typeof (provider as Partial<TranscriptionCapableProvider>)?.transcription ===
  'function';

// Probed rather than kept as a per-package allowlist: Anthropic, Mistral, xAI
// and Bedrock ship no speech-to-text today, and a provider that gains one later
// starts working without a change here. An absent factory is also what the
// registry reads to refuse a misconfigured transcription model up front,
// instead of throwing on the first dictation.
export const getTranscriptionModelFactory = (
  provider: unknown,
): ((modelId: string) => TranscriptionModel) | undefined => {
  if (!hasTranscriptionFactory(provider)) {
    return undefined;
  }

  return (modelId: string) => provider.transcription(modelId);
};
