import { type TranscriptionModel } from 'ai';

type TranscriptionCapableProvider = {
  transcription: (modelId: string) => TranscriptionModel;
};

const hasTranscriptionFactory = (
  provider: unknown,
): provider is TranscriptionCapableProvider =>
  typeof (provider as Partial<TranscriptionCapableProvider>)?.transcription ===
  'function';

export const getTranscriptionModelFactory = (
  provider: unknown,
): ((modelId: string) => TranscriptionModel) | undefined => {
  if (!hasTranscriptionFactory(provider)) {
    return undefined;
  }

  return (modelId: string) => provider.transcription(modelId);
};
