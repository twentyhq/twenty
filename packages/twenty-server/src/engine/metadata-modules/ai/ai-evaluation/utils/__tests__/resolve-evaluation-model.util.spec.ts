import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import {
  resolveEvaluationModel,
  type EvaluationModelCandidates,
} from 'src/engine/metadata-modules/ai/ai-evaluation/utils/resolve-evaluation-model.util';

const resolve = (candidates: Partial<EvaluationModelCandidates> = {}) =>
  resolveEvaluationModel({
    isRequestedRunnableEvaluationModel: false,
    isRequestedRunnableLanguageModel: false,
    isRequestedKnownEvaluationModel: false,
    getDefaultLanguageModelId: () => 'openai/gpt-5-nano',
    ...candidates,
  });

describe('resolveEvaluationModel', () => {
  it('should run a pinned evaluation model natively', () => {
    expect(
      resolve({
        requestedModelId: 'typesafe-ai/jev-latest',
        isRequestedRunnableEvaluationModel: true,
      }),
    ).toEqual({
      modelId: 'typesafe-ai/jev-latest',
      runnerKind: 'evaluation-model',
    });
  });

  it('should run a pinned language model through structured output', () => {
    expect(
      resolve({
        requestedModelId: 'openai/gpt-5-nano',
        isRequestedRunnableLanguageModel: true,
      }),
    ).toEqual({
      modelId: 'openai/gpt-5-nano',
      runnerKind: 'language-model',
    });
  });

  // The catalog ships Jev whether or not its SDK package is installed, so a
  // pinned id the catalog knows and cannot run is the default state, not an
  // edge case. Routing it natively would fail every such step.
  it('should pass over a pinned model the catalog knows but cannot run', () => {
    expect(
      resolve({
        requestedModelId: 'typesafe-ai/jev-latest',
        isRequestedKnownEvaluationModel: true,
      }),
    ).toEqual({
      modelId: 'openai/gpt-5-nano',
      runnerKind: 'language-model',
      skippedModelId: 'typesafe-ai/jev-latest',
    });
  });

  it('should prefer another runnable evaluation model over a language model', () => {
    expect(
      resolve({
        requestedModelId: 'typesafe-ai/jev-latest',
        isRequestedKnownEvaluationModel: true,
        defaultEvaluationModelId: 'other/evaluator',
      }),
    ).toEqual({
      modelId: 'other/evaluator',
      runnerKind: 'evaluation-model',
      skippedModelId: 'typesafe-ai/jev-latest',
    });
  });

  it('should refuse a model id nothing knows', () => {
    expect(() =>
      resolve({ requestedModelId: 'openai/does-not-exist' }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      }),
    );
  });

  it.each([
    ['nothing pinned', undefined],
    ['an empty pin', ''],
    ['the auto-select id', AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID],
  ])(
    'should take the first runnable evaluation model given %s',
    (_label, requestedModelId) => {
      expect(
        resolve({
          requestedModelId,
          defaultEvaluationModelId: 'typesafe-ai/jev-latest',
        }),
      ).toEqual({
        modelId: 'typesafe-ai/jev-latest',
        runnerKind: 'evaluation-model',
      });
    },
  );

  it('should fall back to the workspace language model when none is configured', () => {
    expect(resolve()).toEqual({
      modelId: 'openai/gpt-5-nano',
      runnerKind: 'language-model',
    });
  });

  // Resolving the workspace default throws when no language model is
  // registered, so a run that lands on an evaluation model must not ask.
  it('should not resolve the language default when an evaluation model wins', () => {
    const getDefaultLanguageModelId = jest.fn(() => 'openai/gpt-5-nano');

    resolve({
      requestedModelId: 'typesafe-ai/jev-latest',
      isRequestedRunnableEvaluationModel: true,
      getDefaultLanguageModelId,
    });
    resolve({
      defaultEvaluationModelId: 'typesafe-ai/jev-latest',
      getDefaultLanguageModelId,
    });

    expect(getDefaultLanguageModelId).not.toHaveBeenCalled();
  });
});
