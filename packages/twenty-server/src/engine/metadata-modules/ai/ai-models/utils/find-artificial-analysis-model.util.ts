import { type ArtificialAnalysisModel } from 'src/engine/metadata-modules/ai/ai-models/types/artificial-analysis-response.schema';

const normalizeModelIdentifier = (value: string): string =>
  value.toLowerCase().replace(/[ ._-]/g, '');

export const findArtificialAnalysisModel = ({
  models,
  modelId,
  label,
}: {
  models: ArtificialAnalysisModel[];
  modelId: string;
  label: string;
}): ArtificialAnalysisModel | undefined => {
  const modelName = modelId.substring(modelId.lastIndexOf('/') + 1);
  const identifiers = [modelName, label].map(normalizeModelIdentifier);
  const matches = models.filter((model) =>
    [model.slug, model.name].some((identifier) =>
      identifiers.includes(normalizeModelIdentifier(identifier)),
    ),
  );

  // Never guess a different model version or choose between ambiguous benchmarks.
  return matches.length === 1 ? matches[0] : undefined;
};
