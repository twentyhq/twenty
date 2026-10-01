import {
  type Experimental_EvaluationAnswer,
  type Experimental_EvaluationModel,
  type Experimental_EvaluationQuestion,
} from 'ai';

// aliases keep the SDK's experimental prefix out of engine code

export type AiEvaluationModel = Experimental_EvaluationModel;

export type AiEvaluationModelQuestion = Experimental_EvaluationQuestion;

// distributes over the question union
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
