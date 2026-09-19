import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { assertEvaluationQuestionsAreSupported } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-evaluation-questions-are-supported.util';
import { type AiEvaluationModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model-config.type';

const buildModelConfig = (
  overrides: Partial<AiEvaluationModelConfig> = {},
): AiEvaluationModelConfig => ({
  modelId: 'typesafe-ai/jev-latest',
  sdkPackage: '@ai-sdk/typesafe-ai',
  label: 'Jev',
  description: 'Jev',
  inputCostPerMillionTokens: 0.042,
  outputCostPerMillionTokens: 0,
  supportedQuestionTypes: ['choice', 'score', 'boolean'],
  maxCriteriaPerQuestion: 255,
  ...overrides,
});

describe('assertEvaluationQuestionsAreSupported', () => {
  it('should pass when every question type is declared', () => {
    expect(() =>
      assertEvaluationQuestionsAreSupported({
        questions: {
          intent: {
            type: 'choice',
            instructions: 'Which?',
            criteria: { a: null, b: null },
          },
        },
        modelConfig: buildModelConfig(),
      }),
    ).not.toThrow();
  });

  it('should refuse a question type the model does not declare', () => {
    expect(() =>
      assertEvaluationQuestionsAreSupported({
        questions: {
          urgency: {
            type: 'score',
            instructions: 'How urgent?',
            criteria: ['low', 'high'],
          },
        },
        modelConfig: buildModelConfig({ supportedQuestionTypes: ['choice'] }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
      }),
    );
  });

  it('should refuse more criteria than the model accepts', () => {
    expect(() =>
      assertEvaluationQuestionsAreSupported({
        questions: {
          intent: {
            type: 'choice',
            instructions: 'Which?',
            criteria: { a: null, b: null, c: null },
          },
        },
        modelConfig: buildModelConfig({ maxCriteriaPerQuestion: 2 }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
      }),
    );
  });

  it('should not cap criteria when the model declares no limit', () => {
    expect(() =>
      assertEvaluationQuestionsAreSupported({
        questions: {
          intent: {
            type: 'choice',
            instructions: 'Which?',
            criteria: Object.fromEntries(
              Array.from({ length: 500 }, (_, index) => [`o${index}`, null]),
            ),
          },
        },
        modelConfig: buildModelConfig({ maxCriteriaPerQuestion: undefined }),
      }),
    ).not.toThrow();
  });
});
