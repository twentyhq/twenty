import { Test, type TestingModule } from '@nestjs/testing';

import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiEvaluationService } from 'src/engine/metadata-modules/ai/ai-evaluation/services/ai-evaluation.service';
import { LanguageModelEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/language-model-evaluation.runner';
import { NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const QUESTIONS = {
  intent: {
    type: 'choice' as const,
    instructions: 'What does the message ask for?',
    criteria: { pricing: null, support: null },
  },
};

const ANSWER = {
  answers: { intent: { type: 'choice' as const, choice: 'pricing' } },
  usage: { inputTokens: 120, outputTokens: 0 },
};

describe('AiEvaluationService', () => {
  let service: AiEvaluationService;
  let registry: jest.Mocked<
    Pick<
      AiModelRegistryService,
      | 'getEvaluationModel'
      | 'getEvaluationModelConfig'
      | 'getDefaultEvaluationModel'
      | 'getModel'
      | 'getEffectiveModelConfig'
    >
  >;
  let nativeRunner: { run: jest.Mock };
  let languageModelRunner: { run: jest.Mock };

  beforeEach(async () => {
    registry = {
      getEvaluationModel: jest.fn().mockReturnValue(undefined),
      getEvaluationModelConfig: jest.fn().mockReturnValue(undefined),
      getDefaultEvaluationModel: jest.fn().mockReturnValue(undefined),
      getModel: jest.fn().mockReturnValue(undefined),
      getEffectiveModelConfig: jest
        .fn()
        .mockReturnValue({ modelId: 'openai/gpt-5-nano' }),
    };
    nativeRunner = { run: jest.fn().mockResolvedValue(ANSWER) };
    languageModelRunner = { run: jest.fn().mockResolvedValue(ANSWER) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiEvaluationService,
        { provide: AiModelRegistryService, useValue: registry },
        { provide: NativeEvaluationRunner, useValue: nativeRunner },
        {
          provide: LanguageModelEvaluationRunner,
          useValue: languageModelRunner,
        },
        {
          provide: AiBillingService,
          useValue: { calculateAndBillUsage: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AiEvaluationService>(AiEvaluationService);
  });

  const evaluate = (modelId?: string) =>
    service.evaluate({
      workspaceId: 'ws-1',
      modelId,
      state: 'I want a quote',
      questions: QUESTIONS,
    });

  it('should run an explicitly pinned evaluation model natively', async () => {
    registry.getEvaluationModel.mockReturnValue({
      modelId: 'typesafe-ai/jev-latest',
    } as never);

    const result = await evaluate('typesafe-ai/jev-latest');

    expect(result.runnerKind).toBe('evaluation-model');
    expect(result.modelId).toBe('typesafe-ai/jev-latest');
    expect(nativeRunner.run).toHaveBeenCalledTimes(1);
    expect(languageModelRunner.run).not.toHaveBeenCalled();
  });

  it('should run an explicitly pinned language model through structured output', async () => {
    registry.getModel.mockReturnValue({
      modelId: 'openai/gpt-5-nano',
    } as never);

    const result = await evaluate('openai/gpt-5-nano');

    expect(result.runnerKind).toBe('language-model');
    expect(languageModelRunner.run).toHaveBeenCalledTimes(1);
    expect(nativeRunner.run).not.toHaveBeenCalled();
  });

  // The catalog ships Jev whether or not its SDK package is installed, so a
  // pinned id with a config and no runnable model is the default state, not an
  // edge case. Routing it to the native runner would fail every such step.
  it('should fall back when a pinned evaluation model is in the catalog but not runnable', async () => {
    registry.getEvaluationModelConfig.mockReturnValue({
      modelId: 'typesafe-ai/jev-latest',
    } as never);

    const result = await evaluate('typesafe-ai/jev-latest');

    expect(result.runnerKind).toBe('language-model');
    expect(result.modelId).toBe('openai/gpt-5-nano');
    expect(languageModelRunner.run).toHaveBeenCalledTimes(1);
    expect(nativeRunner.run).not.toHaveBeenCalled();
  });

  it('should prefer another runnable evaluation model over dropping to a language model', async () => {
    registry.getEvaluationModelConfig.mockReturnValue({
      modelId: 'typesafe-ai/jev-latest',
    } as never);
    registry.getDefaultEvaluationModel.mockReturnValue({
      modelId: 'other/evaluator',
    } as never);

    const result = await evaluate('typesafe-ai/jev-latest');

    expect(result).toMatchObject({
      modelId: 'other/evaluator',
      runnerKind: 'evaluation-model',
    });
  });

  it('should refuse a model id nothing in the catalog knows', async () => {
    await expect(evaluate('openai/does-not-exist')).rejects.toMatchObject({
      code: AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    });
  });

  it('should default to the first runnable evaluation model when none is pinned', async () => {
    registry.getDefaultEvaluationModel.mockReturnValue({
      modelId: 'typesafe-ai/jev-latest',
    } as never);

    await expect(evaluate()).resolves.toMatchObject({
      modelId: 'typesafe-ai/jev-latest',
      runnerKind: 'evaluation-model',
    });
  });

  it('should default to the workspace language model when no evaluation model is configured', async () => {
    await expect(evaluate()).resolves.toMatchObject({
      modelId: 'openai/gpt-5-nano',
      runnerKind: 'language-model',
    });
  });

  it('should refuse a request with no questions before resolving a model', async () => {
    await expect(
      service.evaluate({
        workspaceId: 'ws-1',
        state: 'anything',
        questions: {},
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_EVALUATION_REQUEST,
    });
    expect(registry.getDefaultEvaluationModel).not.toHaveBeenCalled();
  });
});
