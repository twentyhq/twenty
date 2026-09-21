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
    isRequestedAdminAllowed: true,
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

  // Substituting a model changes what the step costs, where the data goes and
  // whether an answer carries a calibrated probability. A step that named a
  // model asked for those properties, so it fails rather than quietly getting
  // different ones.
  it('should refuse a pinned model the catalog knows but cannot run', () => {
    expect(() =>
      resolve({
        requestedModelId: 'typesafe-ai/jev-latest',
        isRequestedKnownEvaluationModel: true,
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      }),
    );
  });

  it('should refuse a pinned model even when another evaluation model could run', () => {
    expect(() =>
      resolve({
        requestedModelId: 'typesafe-ai/jev-latest',
        isRequestedKnownEvaluationModel: true,
        defaultEvaluationModelId: 'other/evaluator',
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      }),
    );
  });

  // A step must not be a way around a model an administrator withdrew.
  it.each([
    ['an evaluation model', { isRequestedRunnableEvaluationModel: true }],
    ['a language model', { isRequestedRunnableLanguageModel: true }],
  ])('should refuse a pinned %s that is admin-disabled', (_label, runnable) => {
    expect(() =>
      resolve({
        requestedModelId: 'typesafe-ai/jev-latest',
        isRequestedAdminAllowed: false,
        ...runnable,
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      }),
    );
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
