import { WORKFLOW_VALIDATION_STEP_TYPES } from '@/workflow/validation/constants/workflow-validation-step-types';
import {
  type ValidatableWorkflow,
  type WorkflowValidationIssueCode,
} from '@/workflow/validation/types/workflow-validation.type';
import { buildWorkflowGraph } from '../build-workflow-graph.util';
import { validateWorkflowGraph } from '../validate-workflow-graph.util';

const getCodes = (
  workflow: ValidatableWorkflow,
): WorkflowValidationIssueCode[] =>
  validateWorkflowGraph({
    workflow,
    graph: buildWorkflowGraph(workflow),
  }).map((issue) => issue.code);

describe('validateWorkflowGraph', () => {
  it('should return no issues for a valid linear workflow', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [{ id: 's1', type: 'CODE', nextStepIds: [] }],
    };

    expect(getCodes(workflow)).toEqual([]);
  });

  it('should flag duplicate step ids', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [
        { id: 's1', type: 'CODE' },
        { id: 's1', type: 'CODE' },
      ],
    };

    expect(getCodes(workflow)).toContain('DUPLICATE_STEP_ID');
  });

  it('should flag a trigger with no connected step', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL' },
      steps: [{ id: 's1', type: 'CODE' }],
    };

    expect(getCodes(workflow)).toContain('TRIGGER_HAS_NO_NEXT_STEP');
  });

  it('should flag a dangling trigger reference', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['ghost'] },
      steps: [{ id: 's1', type: 'CODE' }],
    };

    expect(getCodes(workflow)).toContain('DANGLING_REFERENCE');
  });

  it('should flag unreachable steps', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [
        { id: 's1', type: 'CODE' },
        { id: 'orphan', type: 'CODE' },
      ],
    };

    expect(getCodes(workflow)).toContain('UNREACHABLE_STEP');
  });

  it('should flag an if-else step with fewer than two branches', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['if'] },
      steps: [
        {
          id: 'if',
          type: WORKFLOW_VALIDATION_STEP_TYPES.IF_ELSE,
          settings: { input: { branches: [{ nextStepIds: ['end'] }] } },
        },
        { id: 'end', type: 'CODE' },
      ],
    };

    expect(getCodes(workflow)).toContain('IF_ELSE_INSUFFICIENT_BRANCHES');
  });

  it('should flag an if-else branch with no connected step', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['if'] },
      steps: [
        {
          id: 'if',
          type: WORKFLOW_VALIDATION_STEP_TYPES.IF_ELSE,
          settings: {
            input: {
              branches: [{ nextStepIds: ['end'] }, { nextStepIds: [] }],
            },
          },
        },
        { id: 'end', type: 'CODE' },
      ],
    };

    expect(getCodes(workflow)).toContain('IF_ELSE_BRANCH_HAS_NO_NEXT_STEP');
  });

  it('should flag an iterator with items but no loop body', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['iterator'] },
      steps: [
        {
          id: 'iterator',
          type: WORKFLOW_VALIDATION_STEP_TYPES.ITERATOR,
          settings: {
            input: { items: '{{trigger.items}}', initialLoopStepIds: [] },
          },
        },
      ],
    };

    expect(getCodes(workflow)).toContain('ITERATOR_MISSING_LOOP_BODY');
  });
});
