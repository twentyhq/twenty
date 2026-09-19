import { isNonEmptyString } from '@sniptt/guards';
import {
  CLASSIFY_ANSWER_NAME_PATTERN,
  type WorkflowClassifyQuestion,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type WorkflowClassifyAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// A blank question reaches the provider as an empty instruction and fails the
// run, so the gap is reported while the workflow can still be edited.
const getQuestionProblem = (
  question: WorkflowClassifyQuestion,
): string | undefined => {
  if (!isNonEmptyString(question.name)) {
    return 'has an unnamed question';
  }

  if (!CLASSIFY_ANSWER_NAME_PATTERN.test(question.name)) {
    return `names an answer "${question.name}" that is not a valid variable key`;
  }

  if (!isNonEmptyString(question.instructions)) {
    return `has no instructions for "${question.name}"`;
  }

  if (question.type === 'choice' && question.criteria.length === 0) {
    return `has no options for "${question.name}"`;
  }

  // A one-level rubric has nothing to grade between.
  if (question.type === 'score' && question.criteria.length < 2) {
    return `has fewer than two levels for "${question.name}"`;
  }

  if (
    question.type !== 'boolean' &&
    question.criteria.some((criterion) => !isNonEmptyString(criterion.name))
  ) {
    return `has an unnamed option for "${question.name}"`;
  }

  // Only for a choice: its options key a map, so a repeat drops one before the
  // model ever sees it. Score levels are positional and keep their count.
  if (question.type === 'choice') {
    const optionNames = question.criteria.map((criterion) => criterion.name);
    const duplicateName = optionNames.find(
      (name, index) => optionNames.indexOf(name) !== index,
    );

    if (isNonEmptyString(duplicateName)) {
      return `lists the option "${duplicateName}" twice for "${question.name}"`;
    }
  }

  return undefined;
};

export const validateWorkflowClassifyStep = (
  step: WorkflowClassifyAction,
): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];
  const stepLabel = step.name ?? step.id;
  const input = step.settings?.input;

  if (!isNonEmptyString(input?.state)) {
    issues.push({
      severity: 'error',
      code: 'CLASSIFY_MISSING_STATE',
      message: `Classify step "${stepLabel}" has nothing to classify.`,
      stepId: step.id,
    });
  }

  const questions = input?.questions ?? [];

  if (questions.length === 0) {
    issues.push({
      severity: 'error',
      code: 'CLASSIFY_INCOMPLETE_QUESTION',
      message: `Classify step "${stepLabel}" asks no questions.`,
      stepId: step.id,
    });
  }

  const seenNames = new Set<string>();

  for (const question of questions) {
    const problem = getQuestionProblem(question);

    if (isNonEmptyString(problem)) {
      issues.push({
        severity: 'error',
        code: 'CLASSIFY_INCOMPLETE_QUESTION',
        message: `Classify step "${stepLabel}" ${problem}.`,
        stepId: step.id,
      });
      continue;
    }

    // Answers are keyed by name, so a repeat would overwrite the earlier one.
    if (seenNames.has(question.name)) {
      issues.push({
        severity: 'error',
        code: 'CLASSIFY_INCOMPLETE_QUESTION',
        message: `Classify step "${stepLabel}" asks two questions named "${question.name}".`,
        stepId: step.id,
      });
      continue;
    }

    seenNames.add(question.name);
  }

  return issues;
};
