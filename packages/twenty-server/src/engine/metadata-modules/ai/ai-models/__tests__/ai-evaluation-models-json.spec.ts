import { z } from 'zod';

import defaultAiEvaluationModels from 'src/engine/metadata-modules/ai/ai-models/ai-evaluation-models.json';
import { aiProviderModelConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.schema';

// hand-maintained: models.dev has no evaluation models, so the daily sync cannot add or keep them
const evaluationVendorsSchema = z.record(
  z.string(),
  z.object({ models: z.array(aiProviderModelConfigSchema).nonempty() }),
);

describe('ai-evaluation-models.json integrity', () => {
  it('should pass Zod schema validation', () => {
    expect(() =>
      evaluationVendorsSchema.parse(defaultAiEvaluationModels),
    ).not.toThrow();
  });

  const vendors = evaluationVendorsSchema.parse(defaultAiEvaluationModels);

  it('should carry evaluation models only', () => {
    Object.values(vendors).forEach((vendor) => {
      vendor.models.forEach((model) => {
        expect(model.kind).toBe('evaluation');
      });
    });
  });

  it('should price every model, free output included', () => {
    Object.values(vendors).forEach((vendor) => {
      vendor.models.forEach((model) => {
        // an omitted price bills nothing while the provider still charges
        expect(model.inputCostPerMillionTokens).toBeDefined();
        expect(model.outputCostPerMillionTokens).toBeDefined();
      });
    });
  });

  it('should size no context window', () => {
    Object.values(vendors).forEach((vendor) => {
      vendor.models.forEach((model) => {
        expect(model.contextWindowTokens).toBeUndefined();
        expect(model.maxOutputTokens).toBeUndefined();
      });
    });
  });

  // residency and retention depend on each self-hosted instance's own provider accounts
  it('should not assert data residency or zero data retention', () => {
    Object.values(vendors).forEach((vendor) => {
      vendor.models.forEach((model) => {
        expect(model.dataResidency).toBeUndefined();
        expect(model.zeroDataRetention).toBeUndefined();
      });
    });
  });

  // routes belong to ai-self-host-spec.json, and a credential here would be committed
  it('should carry no routing or credentials', () => {
    Object.values(defaultAiEvaluationModels).forEach((vendor) => {
      expect(Object.keys(vendor)).toEqual(['models']);
    });
  });
});
