import {
  type Experimental_EvaluationAnswer,
  type Experimental_EvaluationModel,
  type Experimental_EvaluationQuestion,
} from 'ai';

// aliases, not copies: an SDK spec change breaks the build here; they keep the experimental prefix out of engine code

export type AiEvaluationModel = Exclude<Experimental_EvaluationModel, string>;

export type AiEvaluationModelQuestion = Experimental_EvaluationQuestion;

// distributes over the question union, so this is every answer shape, not one
export type AiEvaluationModelAnswer =
  Experimental_EvaluationAnswer<Experimental_EvaluationQuestion>;

// the SDK only exports these through the model
export type AiEvaluationModelCallOptions = Parameters<
  AiEvaluationModel['doEvaluate']
>[0];

export type AiEvaluationModelResult = Awaited<
  ReturnType<AiEvaluationModel['doEvaluate']>
>;

export type AiEvaluationModelInput = AiEvaluationModelCallOptions['state'];
