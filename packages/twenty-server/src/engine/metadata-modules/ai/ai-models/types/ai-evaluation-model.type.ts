import {
  type Experimental_EvaluationAnswer,
  type Experimental_EvaluationModel,
  type Experimental_EvaluationQuestion,
} from 'ai';

// Local names for the AI SDK's evaluation spec. These are aliases, not a
// restatement: the SDK owns the shape, so a spec change breaks the build here
// instead of drifting silently. The prefix the SDK uses while the API is
// experimental is kept out of the engine's own code.

export type AiEvaluationModel = Experimental_EvaluationModel;

export type AiEvaluationModelQuestion = Experimental_EvaluationQuestion;

// Distributes over the question union, so this is the union of every answer
// shape rather than one of them.
export type AiEvaluationModelAnswer =
  Experimental_EvaluationAnswer<Experimental_EvaluationQuestion>;

// The SDK exports the call and result shapes only through the model, so they
// are read back off it.
export type AiEvaluationModelCallOptions = Parameters<
  AiEvaluationModel['doEvaluate']
>[0];

export type AiEvaluationModelResult = Awaited<
  ReturnType<AiEvaluationModel['doEvaluate']>
>;

export type AiEvaluationModelInput = AiEvaluationModelCallOptions['state'];
