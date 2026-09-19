import { Test } from '@nestjs/testing';
import { generateObject } from 'ai';

import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiClassificationService } from 'src/engine/metadata-modules/ai/ai-classification/ai-classification.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';

jest.mock('ai', () => ({ generateObject: jest.fn() }));
jest.mock(
  'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service',
  () => ({ AiBillingService: class {} }),
);
jest.mock(
  'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service',
  () => ({ AiModelRegistryService: class {} }),
);
jest.mock(
  'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service',
  () => ({ AiModelConfigService: class {} }),
);

const input = {
  modelId: 'typesafe/jev-1.13.0',
  text: 'A duplicate charge',
  instructions: 'Choose a team',
  categories: [
    { label: 'billing', description: 'Payments' },
    { label: 'support', description: 'Bugs' },
  ],
};
const result = {
  category: 'billing',
  probability: 0.9,
  probabilities: [
    { category: 'billing', probability: 0.9 },
    { category: 'support', probability: 0.1 },
  ],
  resolvedModelId: 'jev-1.13.0',
  usage: { inputTokens: 1000, outputTokens: 24 },
};

describe('AiClassificationService', () => {
  let service: AiClassificationService;
  const classify = jest.fn();
  const registry = {
    validateModelAvailability: jest.fn(),
    getModelConfig: jest.fn(),
    getEvaluationModel: jest.fn(),
    getModel: jest.fn(),
  };
  const billing = {
    assertAiExecutionAllowed: jest.fn(),
    calculateAndBillUsage: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    classify.mockResolvedValue(result);
    registry.getEvaluationModel.mockReturnValue({ classify });
    registry.getModelConfig.mockReturnValue({ kind: 'evaluation' });
    const module = await Test.createTestingModule({
      providers: [
        AiClassificationService,
        { provide: AiModelRegistryService, useValue: registry },
        {
          provide: AiModelConfigService,
          useValue: { getReasoningProviderOptions: () => ({}) },
        },
        { provide: AiBillingService, useValue: billing },
      ],
    }).compile();
    service = module.get(AiClassificationService);
  });

  it('meters successful evaluation calls and preserves probabilities', async () => {
    await expect(
      service.classify(input, 'workspace', 'member'),
    ).resolves.toEqual({ ...result, modelId: input.modelId });
    expect(registry.validateModelAvailability).toHaveBeenCalledWith(
      input.modelId,
      'evaluation',
    );
    expect(billing.assertAiExecutionAllowed).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace',
        spenders: { userWorkspaceId: 'member' },
      }),
    );
    expect(billing.calculateAndBillUsage).toHaveBeenCalledWith(
      input.modelId,
      expect.objectContaining({
        usage: expect.objectContaining({ inputTokens: 1000, outputTokens: 24 }),
      }),
      'workspace',
      expect.any(String),
      null,
      'member',
    );
    expect(generateObject).not.toHaveBeenCalled();
  });

  it.each([
    { ...input, text: '' },
    { ...input, categories: [input.categories[0]] },
    { ...input, categories: [input.categories[0], input.categories[0]] },
    { ...input, text: { unexpected: true } },
  ])(
    'rejects invalid input before calling a provider',
    async (invalidInput) => {
      await expect(
        service.classify(invalidInput, 'workspace'),
      ).rejects.toThrow();
      expect(classify).not.toHaveBeenCalled();
      expect(billing.calculateAndBillUsage).not.toHaveBeenCalled();
    },
  );

  it('does not call a disabled model', async () => {
    registry.validateModelAvailability.mockImplementation(() => {
      throw new Error('Disabled');
    });
    await expect(service.classify(input, 'workspace')).rejects.toThrow(
      'Disabled',
    );
    expect(classify).not.toHaveBeenCalled();
  });

  it('checks quotas before sending customer data', async () => {
    billing.assertAiExecutionAllowed.mockRejectedValue(
      new Error('Quota exceeded'),
    );
    await expect(service.classify(input, 'workspace')).rejects.toThrow(
      'Quota exceeded',
    );
    expect(classify).not.toHaveBeenCalled();
  });

  it('fails when the model is unavailable without silently switching providers', async () => {
    registry.getEvaluationModel.mockReturnValue(undefined);
    await expect(service.classify(input, 'workspace')).rejects.toThrow(
      'not configured',
    );
    expect(generateObject).not.toHaveBeenCalled();
  });

  it('supports language models without inventing probabilities', async () => {
    registry.getEvaluationModel.mockReturnValue(undefined);
    registry.getModel.mockReturnValue({ model: 'test-language-model' });
    jest.mocked(generateObject).mockResolvedValue({
      object: { category: 'billing' },
      usage: { inputTokens: 10, outputTokens: 5 },
      response: { modelId: 'resolved-language-model' },
    } as Awaited<ReturnType<typeof generateObject>>);
    const classification = await service.classify(
      { ...input, modelId: 'openai/model' },
      'workspace',
    );
    expect(classification).toEqual(
      expect.objectContaining({
        category: 'billing',
        probability: null,
        probabilities: null,
        resolvedModelId: 'resolved-language-model',
      }),
    );
    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        maxRetries: 0,
        abortSignal: expect.any(AbortSignal),
      }),
    );
    expect(billing.calculateAndBillUsage).toHaveBeenCalledTimes(1);
  });
});
