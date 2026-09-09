import { type ArtificialAnalysisModel } from 'src/engine/metadata-modules/ai/ai-models/types/artificial-analysis-response.schema';
import { AI_SDK_BEDROCK } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

const normalizeModelIdentifier = (value: string): string =>
  value.toLowerCase().replace(/[ ._-]/g, '');

const normalizeBedrockModelIdentifier = (value: string): string =>
  value
    .replace(/^(global|us|eu|apac)\./i, '')
    .replace(/^[^.]+\./, '')
    .replace(/-v\d+(?::\d+)?$/i, '');

const removeBedrockLabelSuffix = (value: string): string =>
  value.replace(
    /\s*\((?:(?:AWS|Amazon)\s+)?Bedrock(?:\s+(?:Global|US|EU|APAC))?\)\s*$/i,
    '',
  );

export const findArtificialAnalysisModel = ({
  models,
  modelId,
  label,
  sdkPackage,
}: {
  models: ArtificialAnalysisModel[];
  modelId: string;
  label: string;
  sdkPackage?: string | null;
}): ArtificialAnalysisModel | undefined => {
  const modelName = modelId.substring(modelId.lastIndexOf('/') + 1);
  const routingIdentifiers = [modelName, label];

  if (sdkPackage === AI_SDK_BEDROCK) {
    routingIdentifiers.push(
      normalizeBedrockModelIdentifier(modelName),
      removeBedrockLabelSuffix(label),
    );
  }

  const identifiers = routingIdentifiers.map(normalizeModelIdentifier);
  const matches = models.filter((model) =>
    [model.slug, model.name].some((identifier) =>
      identifiers.includes(normalizeModelIdentifier(identifier)),
    ),
  );

  // Never guess a different model version or choose between ambiguous benchmarks.
  return matches.length === 1 ? matches[0] : undefined;
};
