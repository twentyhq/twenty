import { isDefined } from 'twenty-shared/utils';

import {
  type AiEvaluationModelInput,
  type AiEvaluationModelQuestion,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

export const EVALUATION_SYSTEM_PROMPT = [
  'You classify structured state. Answer every question strictly from the state you are given.',
  'Never infer facts the state does not contain; when it is silent, pick the option that best reflects that silence.',
  'Answer only in the requested structure. Do not explain your reasoning.',
].join('\n');

const renderInput = (input: AiEvaluationModelInput): string =>
  typeof input === 'string' ? input : JSON.stringify(input, null, 2);

const renderCriteria = (question: AiEvaluationModelQuestion): string[] => {
  switch (question.type) {
    case 'choice':
      return [
        'Pick exactly one option:',
        ...Object.entries(question.criteria).map(([name, description]) =>
          isDefined(description)
            ? `- ${name}: ${renderInput(description)}`
            : `- ${name}`,
        ),
      ];
    case 'score':
      return [
        `Grade on this ladder and answer with the level index, from 0 to ${question.criteria.length - 1}:`,
        ...question.criteria.map((description, level) =>
          isDefined(description)
            ? `- ${level}: ${renderInput(description)}`
            : `- ${level}`,
        ),
      ];
    case 'boolean':
      return [
        'Answer with the probability that this holds, from 0 to 1.',
        ...(isDefined(question.criteria?.true)
          ? [`- true means: ${renderInput(question.criteria.true)}`]
          : []),
        ...(isDefined(question.criteria?.false)
          ? [`- false means: ${renderInput(question.criteria.false)}`]
          : []),
      ];
  }
};

// One prompt for every question, mirroring how an evaluation model reads one
// shared state: the state is paid for once whichever path runs, so the two
// runners stay comparable on cost.
export const buildEvaluationPrompt = ({
  state,
  questions,
}: {
  state: AiEvaluationModelInput;
  questions: Record<string, AiEvaluationModelQuestion>;
}): string =>
  [
    '<state>',
    renderInput(state),
    '</state>',
    '',
    ...Object.entries(questions).flatMap(([questionId, question]) => [
      `<question id="${questionId}">`,
      renderInput(question.instructions),
      ...renderCriteria(question),
      '</question>',
      '',
    ]),
  ].join('\n');
