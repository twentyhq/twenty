import { MODALITY_TO_MIME_TYPES } from 'src/engine/metadata-modules/ai/ai-chat/constants/modality-to-mime-types.constant';

export const getNativeMimeTypesForModalities = (
  modalities: string[] = [],
): Set<string> =>
  new Set(
    modalities.flatMap((modality) => MODALITY_TO_MIME_TYPES[modality] ?? []),
  );
