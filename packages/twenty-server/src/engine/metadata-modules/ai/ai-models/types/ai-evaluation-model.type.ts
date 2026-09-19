import { type AiEvaluationQuestionType } from 'twenty-shared/ai';

// Twenty's contract for an evaluation model, restating the AI SDK's
// `EvaluationModelV4` specification field for field.
//
// It is declared here rather than imported so the engine depends on the shape a
// provider must have, not on an experimental SDK export that changes in patch
// releases. Any provider object satisfying it plugs in unchanged — the TypeSafe
// provider, a gateway proxying several evaluation models, or an in-house one.

export type AiEvaluationModelInput =
  | string
  | Readonly<Record<string, unknown>>
  | readonly unknown[];

export type AiEvaluationModelQuestion =
  | {
      readonly type: 'choice';
      readonly instructions: AiEvaluationModelInput;
      // Option names mapped to what each one means. Null means no description.
      readonly criteria: Readonly<
        Record<string, AiEvaluationModelInput | null>
      >;
    }
  | {
      readonly type: 'score';
      readonly instructions: AiEvaluationModelInput;
      // At least two ordered levels; a level's index is the score it scores.
      readonly criteria: readonly (AiEvaluationModelInput | null)[];
    }
  | {
      readonly type: 'boolean';
      readonly instructions: AiEvaluationModelInput;
      readonly criteria?: {
        readonly true?: AiEvaluationModelInput | null;
        readonly false?: AiEvaluationModelInput | null;
      };
    };

export type AiEvaluationModelAnswer =
  | {
      type: 'choice';
      choice: string;
      probabilities?: Record<string, number>;
    }
  | {
      type: 'score';
      // Fractional position in [0, levels - 1].
      score: number;
      // Keyed by zero-based level index as a string.
      probabilities?: Record<string, number>;
    }
  | {
      type: 'boolean';
      // P(true), not confidence in whichever side won.
      probability: number;
    };

export type AiEvaluationModelCallOptions = {
  state: AiEvaluationModelInput;
  questions: Readonly<Record<string, AiEvaluationModelQuestion>>;
  abortSignal?: AbortSignal;
  headers?: Record<string, string | undefined>;
  providerOptions?: Record<string, Record<string, unknown>>;
};

export type AiEvaluationModelResult = {
  answers: Record<string, AiEvaluationModelAnswer>;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
  warnings?: unknown[];
  providerMetadata?: Record<string, Record<string, unknown>>;
  response?: {
    id?: string;
    modelId?: string;
    timestamp?: Date;
  };
};

export type AiEvaluationModel = {
  readonly specificationVersion: 'v4';
  readonly provider: string;
  readonly modelId: string;
  readonly supportedQuestionTypes: readonly AiEvaluationQuestionType[];
  // Every question is answered against the same state, or none is.
  doEvaluate(
    options: AiEvaluationModelCallOptions,
  ): PromiseLike<AiEvaluationModelResult>;
};
