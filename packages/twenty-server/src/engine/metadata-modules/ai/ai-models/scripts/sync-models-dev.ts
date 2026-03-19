// Developer tool: compares ai-providers.json against models.dev API.
// Reports pricing diffs, new models, and removed models. Does NOT auto-generate.
//
// Usage: npx ts-node -r tsconfig-paths/register src/engine/metadata-modules/ai/ai-models/scripts/sync-models-dev.ts

/* oxlint-disable eslint(no-console) */

import { loadDefaultAiProviders } from '../utils/load-default-ai-providers.util';
import {
  AiProvider,
  type AiProvidersConfig,
} from '../types/ai-providers.types';

const MODELS_DEV_API_URL = 'https://models.dev/api.json';

const PROVIDER_TYPE_MAP: Record<string, AiProvider> = {
  openai: AiProvider.OPENAI,
  anthropic: AiProvider.ANTHROPIC,
  google: AiProvider.GOOGLE,
  mistral: AiProvider.MISTRAL,
  xai: AiProvider.XAI,
  groq: AiProvider.GROQ,
};

const RELEVANT_PROVIDERS = Object.keys(PROVIDER_TYPE_MAP);

type ModelsDevModel = {
  id: string;
  name: string;
  reasoning?: boolean;
  cost?: { input?: number; output?: number };
  limit?: { context?: number; output?: number };
};

type ModelsDevProvider = {
  id: string;
  models: Record<string, ModelsDevModel>;
};

type ModelsDevData = Record<string, ModelsDevProvider>;

function getCatalogEntries(providers: AiProvidersConfig) {
  const entries: Array<{
    compositeId: string;
    rawModelId: string;
    provider: AiProvider;
    inputCostPerMillionTokens: number;
    outputCostPerMillionTokens: number;
  }> = [];

  for (const [, config] of Object.entries(providers)) {
    for (const model of config.models ?? []) {
      entries.push({
        compositeId: `${config.type}/${model.rawModelId}`,
        rawModelId: model.rawModelId,
        provider: config.type,
        inputCostPerMillionTokens: model.inputCostPerMillionTokens ?? 0,
        outputCostPerMillionTokens: model.outputCostPerMillionTokens ?? 0,
      });
    }
  }

  return entries;
}

async function main() {
  const defaultProviders = loadDefaultAiProviders();

  if (Object.keys(defaultProviders).length === 0) {
    console.error(
      'No default providers found. Make sure ai-providers.json exists.',
    );
    process.exit(1);
  }

  console.log('Fetching models.dev API...\n');

  const response = await fetch(MODELS_DEV_API_URL);

  if (!response.ok) {
    console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const data: ModelsDevData = await response.json();
  const pricingDiffs: string[] = [];
  const newModels: string[] = [];
  const notInModelsdev: string[] = [];
  const catalogEntries = getCatalogEntries(defaultProviders);

  for (const catalogEntry of catalogEntries) {
    if (catalogEntry.provider === AiProvider.BEDROCK) {
      continue;
    }

    const providerKey = Object.entries(PROVIDER_TYPE_MAP).find(
      ([, provider]) => provider === catalogEntry.provider,
    )?.[0];

    if (!providerKey) {
      continue;
    }

    const providerData = data[providerKey];

    if (!providerData) {
      notInModelsdev.push(
        `  ${catalogEntry.compositeId} (provider ${providerKey} not found)`,
      );
      continue;
    }

    const modelsDevModel = providerData.models[catalogEntry.rawModelId];

    if (!modelsDevModel) {
      notInModelsdev.push(`  ${catalogEntry.compositeId}`);
      continue;
    }

    const mdInput = modelsDevModel.cost?.input ?? 0;
    const mdOutput = modelsDevModel.cost?.output ?? 0;
    const catInput = catalogEntry.inputCostPerMillionTokens;
    const catOutput = catalogEntry.outputCostPerMillionTokens;

    if (
      Math.abs(mdInput - catInput) > 0.001 ||
      Math.abs(mdOutput - catOutput) > 0.001
    ) {
      pricingDiffs.push(
        `  ${catalogEntry.compositeId}:` +
          `\n    input:  ours=$${catInput} models.dev=$${mdInput}` +
          `\n    output: ours=$${catOutput} models.dev=$${mdOutput}`,
      );
    }
  }

  const catalogRawIdsByProvider = new Map<string, Set<string>>();

  for (const entry of catalogEntries) {
    const pKey = Object.entries(PROVIDER_TYPE_MAP).find(
      ([, p]) => p === entry.provider,
    )?.[0];

    if (pKey) {
      if (!catalogRawIdsByProvider.has(pKey)) {
        catalogRawIdsByProvider.set(pKey, new Set());
      }
      catalogRawIdsByProvider.get(pKey)!.add(entry.rawModelId);
    }
  }

  for (const providerKey of RELEVANT_PROVIDERS) {
    const providerData = data[providerKey];

    if (!providerData) {
      continue;
    }

    const knownRawIds = catalogRawIdsByProvider.get(providerKey) ?? new Set();

    for (const [modelId, model] of Object.entries(providerData.models)) {
      if (!knownRawIds.has(modelId)) {
        const cost = model.cost
          ? `$${model.cost.input ?? '?'}/$${model.cost.output ?? '?'}`
          : 'no pricing';

        newModels.push(`  ${providerKey}/${modelId} (${cost})`);
      }
    }
  }

  console.log('=== models.dev Sync Report ===\n');

  if (pricingDiffs.length > 0) {
    console.log(`PRICING DIFFS (${pricingDiffs.length}):`);
    console.log(pricingDiffs.join('\n'));
    console.log();
  } else {
    console.log('No pricing diffs found.\n');
  }

  if (notInModelsdev.length > 0) {
    console.log(`NOT IN models.dev (${notInModelsdev.length}):`);
    console.log(notInModelsdev.join('\n'));
    console.log();
  }

  if (newModels.length > 0) {
    console.log(`NEW MODELS AVAILABLE (${newModels.length}):`);
    console.log(newModels.join('\n'));
    console.log();
  } else {
    console.log('No new models available.\n');
  }

  const hasIssues = pricingDiffs.length > 0;

  console.log(
    hasIssues
      ? 'Action needed: review pricing diffs above and update ai-providers.json'
      : 'All good! Catalog is in sync with models.dev pricing.',
  );

  process.exit(hasIssues ? 1 : 0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
