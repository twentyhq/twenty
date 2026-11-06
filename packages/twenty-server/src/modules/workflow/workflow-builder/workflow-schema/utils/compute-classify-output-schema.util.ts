import { isNonEmptyString } from '@sniptt/guards';
import {
  type BaseOutputSchemaV2,
  type Node,
  type WorkflowClassifyQuestion,
} from 'twenty-shared/workflow';

const buildProbabilitiesNode = (keys: string[]): Node => ({
  isLeaf: false,
  type: 'object',
  label: 'Probabilities',
  value: Object.fromEntries(
    keys.map((key) => [
      key,
      { isLeaf: true as const, type: 'number' as const, label: key, value: 0 },
    ]),
  ),
});

const buildAnswerSchema = (
  question: WorkflowClassifyQuestion,
): BaseOutputSchemaV2 => {
  const answerTypeOutputSchema: BaseOutputSchemaV2 = {
    type: { isLeaf: true, type: 'string', label: 'Type', value: question.type },
  };

  switch (question.type) {
    case 'choice':
      return {
        ...answerTypeOutputSchema,
        choice: {
          isLeaf: true,
          type: 'string',
          label: 'Choice',
          value: question.criteria[0]?.name ?? '',
        },
        probabilities: buildProbabilitiesNode(
          question.criteria
            .filter((criterion) => isNonEmptyString(criterion.name))
            .map((criterion) => criterion.name),
        ),
      };
    case 'score':
      return {
        ...answerTypeOutputSchema,
        score: { isLeaf: true, type: 'number', label: 'Score', value: 0 },
        probabilities: buildProbabilitiesNode(
          question.criteria.map((_, level) => String(level)),
        ),
      };
    case 'boolean':
      return {
        ...answerTypeOutputSchema,
        probability: {
          isLeaf: true,
          type: 'number',
          label: 'Probability of true',
          value: 0,
        },
      };
  }
};

// keyed by question name, so downstream steps read {{stepId.answers.<name>.choice}} whatever model answered
export const computeClassifyOutputSchema = (
  questions: WorkflowClassifyQuestion[],
): BaseOutputSchemaV2 => ({
  answers: {
    isLeaf: false,
    type: 'object',
    label: 'Answers',
    value: Object.fromEntries(
      questions
        .filter((question) => isNonEmptyString(question.name))
        .map((question) => [
          question.name,
          {
            isLeaf: false as const,
            type: 'object' as const,
            label: question.name,
            value: buildAnswerSchema(question),
          },
        ]),
    ),
  },
  modelId: { isLeaf: true, type: 'string', label: 'Model', value: '' },
});
