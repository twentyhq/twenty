import { z } from 'zod';

import defaultAiEvaluationModels from 'src/engine/metadata-modules/ai/ai-models/ai-evaluation-models.json';
import { aiProviderModelConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.schema';

// Hand-maintained, unlike ai-models.json: models.dev has no notion of an
// evaluation model, so the daily sync can neither add these nor keep them. The
// sync folds this file into the catalog, which is why it carries what a model
// is and never how it is reached — routes and credentials live in the spec.
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
        // An omitted price bills nothing while the provider still charges, so
        // free output has to say so with an explicit 0.
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

  // Where a self-hosted instance processes and retains data depends on its own
  // provider accounts, so the shipped catalog states neither on its behalf.
  it('should not assert data residency or zero data retention', () => {
    Object.values(vendors).forEach((vendor) => {
      vendor.models.forEach((model) => {
        expect(model.dataResidency).toBeUndefined();
        expect(model.zeroDataRetention).toBeUndefined();
      });
    });
  });

  // Routes belong to ai-self-host-spec.json; a credential here would be
  // committed to the repository and ignored by the pipeline besides.
  it('should carry no routing or credentials', () => {
    Object.values(defaultAiEvaluationModels).forEach((vendor) => {
      expect(Object.keys(vendor)).toEqual(['models']);
    });
  });
});
