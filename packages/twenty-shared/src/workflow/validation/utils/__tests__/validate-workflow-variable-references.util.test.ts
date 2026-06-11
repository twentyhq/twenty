import {
  type ValidatableWorkflow,
  type ValidatableWorkflowStep,
  type WorkflowValidationIssueCode,
} from '@/workflow/validation/types/workflow-validation.type';
import { buildWorkflowGraph } from '../build-workflow-graph.util';
import { validateWorkflowVariableReferences } from '../validate-workflow-variable-references.util';

const OUTPUT_SCHEMA = {
  name: { isLeaf: true, type: 'string', label: 'name', value: 'John' },
};

const getCodes = (
  workflow: ValidatableWorkflow,
): WorkflowValidationIssueCode[] => {
  const steps = workflow.steps ?? [];

  return validateWorkflowVariableReferences({
    workflow,
    graph: buildWorkflowGraph(workflow),
    stepsById: new Map<string, ValidatableWorkflowStep>(
      steps.map((step) => [step.id, step]),
    ),
  }).map((issue) => issue.code);
};

describe('validateWorkflowVariableReferences', () => {
  it('should return no issues for a valid upstream reference that resolves', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [
        {
          id: 's1',
          type: 'CODE',
          nextStepIds: ['s2'],
          settings: { outputSchema: OUTPUT_SCHEMA },
        },
        {
          id: 's2',
          type: 'CODE',
          settings: { input: { value: '{{s1.name}}' } },
        },
      ],
    };

    expect(getCodes(workflow)).toEqual([]);
  });

  it('should flag a variable with an invalid path', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [
        { id: 's1', type: 'CODE', settings: { input: { value: '{{.}}' } } },
      ],
    };

    expect(getCodes(workflow)).toContain('VARIABLE_INVALID_PATH');
  });

  it('should flag a reference to an unknown step', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [
        {
          id: 's1',
          type: 'CODE',
          settings: { input: { value: '{{ghost.name}}' } },
        },
      ],
    };

    expect(getCodes(workflow)).toContain('VARIABLE_UNKNOWN_STEP');
  });

  it('should flag a reference to a step that does not run before it', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1', 's2'] },
      steps: [
        {
          id: 's1',
          type: 'CODE',
          settings: { input: { value: '{{s2.name}}' } },
        },
        { id: 's2', type: 'CODE', settings: { outputSchema: OUTPUT_SCHEMA } },
      ],
    };

    expect(getCodes(workflow)).toContain('VARIABLE_NOT_UPSTREAM');
  });

  it('should flag an upstream reference whose path is not found in the output schema', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [
        {
          id: 's1',
          type: 'CODE',
          nextStepIds: ['s2'],
          settings: { outputSchema: OUTPUT_SCHEMA },
        },
        {
          id: 's2',
          type: 'CODE',
          settings: { input: { value: '{{s1.unknownField}}' } },
        },
      ],
    };

    expect(getCodes(workflow)).toContain('VARIABLE_PATH_NOT_FOUND');
  });

  it('should resolve a valid trigger reference against the trigger output schema', () => {
    const workflow: ValidatableWorkflow = {
      trigger: {
        type: 'MANUAL',
        nextStepIds: ['s1'],
        settings: { outputSchema: OUTPUT_SCHEMA },
      },
      steps: [
        {
          id: 's1',
          type: 'CODE',
          settings: { input: { value: '{{trigger.name}}' } },
        },
      ],
    };

    expect(getCodes(workflow)).toEqual([]);
  });

  // Regression: a trigger reference must never be flagged as not-upstream, even
  // when the trigger has no outgoing connections (so it is not in any ancestor set).
  it('should not flag a trigger reference as not-upstream when the trigger is disconnected', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL' },
      steps: [
        {
          id: 's1',
          type: 'CODE',
          settings: { input: { value: '{{trigger.foo}}' } },
        },
      ],
    };

    expect(getCodes(workflow)).toEqual([]);
  });
});
