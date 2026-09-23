import { z } from 'zod';

import { isDefined } from 'twenty-shared/utils';

import { aiProviderConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.schema';
import { aiProviderModelConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.schema';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

export type SkippedStoredAiCatalogEntry = {
  entry: string;
  reason: string;
};

const storedCatalogSchema = z.record(z.string(), z.unknown());

// Models are read one by one below, so a provider is read without them first.
const storedProviderSchema = aiProviderConfigSchema.extend({
  models: z.array(z.unknown()).optional(),
});

const namedModelSchema = z.object({ name: z.string() });

const describeIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) =>
      issue.path.length > 0
        ? `${issue.path.join('.')}: ${issue.message}`
        : issue.message,
    )
    .join('; ');

const describeModelEntry = ({
  providerKey,
  rawModel,
  index,
}: {
  providerKey: string;
  rawModel: unknown;
  index: number;
}): string => {
  const namedModel = namedModelSchema.safeParse(rawModel);

  return namedModel.success
    ? `${providerKey}/${namedModel.data.name}`
    : `${providerKey}.models[${index}]`;
};

// The stored catalog ships with every deploy and can be newer than the server
// reading it, so an entry this version cannot read is dropped on its own
// rather than taking every other provider down with it.
export const parseStoredAiCatalog = (
  raw: unknown,
): {
  providers: AiProvidersConfig;
  skipped: SkippedStoredAiCatalogEntry[];
} => {
  const providers: AiProvidersConfig = {};
  const skipped: SkippedStoredAiCatalogEntry[] = [];

  for (const [providerKey, rawProvider] of Object.entries(
    storedCatalogSchema.parse(raw),
  )) {
    const providerResult = storedProviderSchema.safeParse(rawProvider);

    if (!providerResult.success) {
      skipped.push({
        entry: providerKey,
        reason: describeIssues(providerResult.error),
      });
      continue;
    }

    const { models: rawModels, ...provider } = providerResult.data;

    if (!isDefined(rawModels)) {
      providers[providerKey] = provider;
      continue;
    }

    const models: AiProviderModelConfig[] = [];

    rawModels.forEach((rawModel, index) => {
      const modelResult = aiProviderModelConfigSchema.safeParse(rawModel);

      if (modelResult.success) {
        models.push(modelResult.data);

        return;
      }

      skipped.push({
        entry: describeModelEntry({ providerKey, rawModel, index }),
        reason: describeIssues(modelResult.error),
      });
    });

    providers[providerKey] = { ...provider, models };
  }

  return { providers, skipped };
};
