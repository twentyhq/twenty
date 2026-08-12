import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { validateStepsHaveVariableReferences } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-steps-have-variable-references.util';

const buildStep = ({
  id = 'step-1',
  name = 'Step 1',
  type,
  input,
}: {
  id?: string;
  name?: string;
  type: WorkflowActionType;
  input?: unknown;
}): WorkflowAction =>
  ({
    id,
    name,
    type,
    settings: { input },
  }) as WorkflowAction;

describe('validateStepsHaveVariableReferences', () => {
  it('should return no issue for an empty step list', () => {
    expect(validateStepsHaveVariableReferences([])).toEqual([]);
  });

  it('should warn when a variable-consuming step references no variable', () => {
    const issues = validateStepsHaveVariableReferences([
      buildStep({
        type: WorkflowActionType.CODE,
        input: { value: 'static' },
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('STEP_HAS_NO_VARIABLE_REFERENCE');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].stepId).toBe('step-1');
  });

  it('should not warn when the step references a variable', () => {
    const issues = validateStepsHaveVariableReferences([
      buildStep({
        type: WorkflowActionType.CODE,
        input: { value: '{{step-0.output}}' },
      }),
    ]);

    expect(issues).toEqual([]);
  });

  it('should ignore action types that do not consume variables', () => {
    const issues = validateStepsHaveVariableReferences([
      buildStep({
        type: WorkflowActionType.FILTER,
        input: { value: 'static' },
      }),
    ]);

    expect(issues).toEqual([]);
  });

  it('should fall back to the step id when the step has no name', () => {
    const issues = validateStepsHaveVariableReferences([
      {
        id: 'unnamed-step',
        type: WorkflowActionType.CODE,
        settings: { input: {} },
      } as WorkflowAction,
    ]);

    expect(issues[0].message).toContain('unnamed-step');
  });

  it('should report one issue per offending step', () => {
    const issues = validateStepsHaveVariableReferences([
      buildStep({ id: 'a', type: WorkflowActionType.CODE, input: {} }),
      buildStep({ id: 'b', type: WorkflowActionType.HTTP_REQUEST, input: {} }),
      buildStep({
        id: 'c',
        type: WorkflowActionType.CODE,
        input: { value: '{{a.output}}' },
      }),
    ]);

    expect(issues.map((issue) => issue.stepId)).toEqual(['a', 'b']);
  });

  it('should not throw when settings have no input', () => {
    const issues = validateStepsHaveVariableReferences([
      {
        id: 'a',
        type: WorkflowActionType.CODE,
        settings: {},
      } as WorkflowAction,
    ]);

    expect(issues).toHaveLength(1);
  });
});
