import { isNonEmptyString } from '@sniptt/guards';
import { type AskQuestionAnswer } from 'twenty-shared/ai';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const hasQuestionAnswerContent = (
  answers: AskQuestionAnswer[],
): boolean =>
  answers.some(
    (answer) =>
      isNonEmptyString(answer.freeText?.trim()) ||
      isNonEmptyArray(answer.selectedOptionIndices),
  );
