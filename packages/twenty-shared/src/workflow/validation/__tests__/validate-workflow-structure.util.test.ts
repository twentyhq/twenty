import { type ValidatableWorkflow } from '@/workflow/validation/types/workflow-validation.type';
import { validateWorkflowStructure } from '../validate-workflow-structure.util';

const getCodes = (workflow: ValidatableWorkflow): string[] => {
  const result = validateWorkflowStructure(workflow);

  return [...result.errors, ...result.warnings].map((issue) => issue.code);
};

describe('validateWorkflowStructure', () => {
  it('should flag a missing trigger and missing steps', () => {
    const result = validateWorkflowStructure({
      trigger: undefined,
      steps: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['MISSING_TRIGGER', 'NO_STEPS']),
    );
  });

  it('should flag a trigger without a type', () => {
    expect(getCodes({ trigger: {}, steps: [] })).toContain(
      'MISSING_TRIGGER_TYPE',
    );
  });

  it('should flag a workflow without steps', () => {
    expect(
      getCodes({ trigger: { type: 'MANUAL' }, steps: [] }),
    ).toContain('NO_STEPS');
  });

  it('should aggregate graph issues such as unreachable steps', () => {
    const result = validateWorkflowStructure({
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [
        { id: 's1', type: 'CODE' },
        { id: 'orphan', type: 'CODE' },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      'UNREACHABLE_STEP',
    );
  });
});
