import { StepLogicalOperator } from '@/types/StepFilters';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import { NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES } from '@/workflow/validation/constants/non-activable-workflow-validation-issue-codes.constant';
import {
  type ValidatableWorkflow,
  type ValidatableWorkflowStep,
} from '@/workflow/validation/types/WorkflowValidation';
import { validateWorkflowStructure } from '../validate-workflow-structure.util';

const getCodes = (workflow: ValidatableWorkflow): string[] => {
  const result = validateWorkflowStructure(workflow);

  return [...result.errors, ...result.warnings].map((issue) => issue.code);
};

const buildStep = ({
  id,
  name,
  type = WorkflowActionType.EMPTY,
  input = {},
  nextStepIds,
}: {
  id: string;
  name: string;
  type?: WorkflowActionType;
  input?: Record<string, unknown>;
  nextStepIds?: string[];
}) => ({
  id,
  name,
  type,
  valid: true,
  nextStepIds,
  settings: {
    input,
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

const buildIteratorStep = ({
  id,
  name,
  initialLoopStepIds,
  nextStepIds,
}: {
  id: string;
  name: string;
  initialLoopStepIds: string[];
  nextStepIds: string[];
}): ValidatableWorkflowStep =>
  buildStep({
    id,
    name,
    type: WorkflowActionType.ITERATOR,
    input: { items: ['first', 'second'], initialLoopStepIds },
    nextStepIds,
  });

const buildManualWorkflow = ([firstStep, ...otherSteps]: [
  ValidatableWorkflowStep,
  ...ValidatableWorkflowStep[],
]): ValidatableWorkflow => ({
  trigger: {
    type: 'MANUAL',
    settings: { outputSchema: {} },
    nextStepIds: [firstStep.id],
  },
  steps: [firstStep, ...otherSteps],
});

const ITERATOR_ID = '00000000-0000-4000-8000-000000000001';
const FILTER_ID = '00000000-0000-4000-8000-000000000002';
const HTTP_ID = '00000000-0000-4000-8000-000000000003';
const AFTER_LOOP_ID = '00000000-0000-4000-8000-000000000004';
const IF_ELSE_ID = '00000000-0000-4000-8000-000000000005';
const IF_STEP_ID = '00000000-0000-4000-8000-000000000006';
const ELSE_STEP_ID = '00000000-0000-4000-8000-000000000007';
const JOIN_ID = '00000000-0000-4000-8000-000000000008';
const OUTER_ID = '00000000-0000-4000-8000-000000000009';
const INNER_ID = '00000000-0000-4000-8000-000000000010';
const INNER_STEP_ID = '00000000-0000-4000-8000-000000000011';

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
    expect(getCodes({ trigger: { type: 'MANUAL' }, steps: [] })).toContain(
      'NO_STEPS',
    );
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
  it('should accept a step whose retryOnFailure value is a legacy boolean', () => {
    const legacyBooleanStep = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Code step',
      type: 'CODE',
      valid: true,
      nextStepIds: [],
      settings: {
        input: { logicFunctionId: 'fn-1', logicFunctionInput: {} },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
      },
    };

    const result = validateWorkflowStructure({
      trigger: {
        type: 'MANUAL',
        nextStepIds: ['11111111-1111-4111-8111-111111111111'],
      },
      steps: [legacyBooleanStep],
    });

    expect(
      result.errors.filter((issue) => issue.code === 'INVALID_STEP_PARAMS'),
    ).toEqual([]);
  });

  describe('iterator loops', () => {
    const buildFilterThenHttpLoop = (lastLoopStepNextStepIds: string[]) =>
      buildManualWorkflow([
        buildIteratorStep({
          id: ITERATOR_ID,
          name: 'Iterator',
          initialLoopStepIds: [FILTER_ID],
          nextStepIds: [AFTER_LOOP_ID],
        }),
        buildStep({ id: FILTER_ID, name: 'Filter', nextStepIds: [HTTP_ID] }),
        buildStep({
          id: HTTP_ID,
          name: 'HTTP request',
          nextStepIds: lastLoopStepNextStepIds,
        }),
        buildStep({ id: AFTER_LOOP_ID, name: 'After loop', nextStepIds: [] }),
      ]);

    it('should block activation when the last loop step does not return to the iterator', () => {
      const result = validateWorkflowStructure(buildFilterThenHttpLoop([]));

      expect(result.errors).toEqual([
        expect.objectContaining({
          code: 'ITERATOR_MISSING_RETURN',
          stepId: HTTP_ID,
          message: expect.stringContaining(
            'Step "HTTP request" must return to iterator "Iterator"',
          ),
        }),
      ]);
      expect(
        NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES.has(
          'ITERATOR_MISSING_RETURN',
        ),
      ).toBe(true);
    });

    it('should accept a loop whose last step returns to the iterator', () => {
      expect(
        validateWorkflowStructure(buildFilterThenHttpLoop([ITERATOR_ID]))
          .errors,
      ).toEqual([]);
    });

    it('should accept If/Else branches that rejoin before returning to the iterator', () => {
      const workflow = buildManualWorkflow([
        buildIteratorStep({
          id: ITERATOR_ID,
          name: 'Iterator',
          initialLoopStepIds: [IF_ELSE_ID],
          nextStepIds: [],
        }),
        buildStep({
          id: IF_ELSE_ID,
          name: 'If/Else',
          type: WorkflowActionType.IF_ELSE,
          input: {
            stepFilterGroups: [
              { id: 'filter-group', logicalOperator: StepLogicalOperator.AND },
            ],
            stepFilters: [],
            branches: [
              {
                id: 'if-branch',
                filterGroupId: 'filter-group',
                nextStepIds: [IF_STEP_ID],
              },
              { id: 'else-branch', nextStepIds: [ELSE_STEP_ID] },
            ],
          },
        }),
        buildStep({ id: IF_STEP_ID, name: 'If step', nextStepIds: [JOIN_ID] }),
        buildStep({
          id: ELSE_STEP_ID,
          name: 'Else step',
          nextStepIds: [JOIN_ID],
        }),
        buildStep({ id: JOIN_ID, name: 'Join', nextStepIds: [ITERATOR_ID] }),
      ]);

      expect(validateWorkflowStructure(workflow).errors).toEqual([]);
    });

    it('should require a nested iterator to return to its enclosing iterator', () => {
      const buildNestedLoops = (innerIteratorNextStepIds: string[]) =>
        buildManualWorkflow([
          buildIteratorStep({
            id: OUTER_ID,
            name: 'Outer',
            initialLoopStepIds: [INNER_ID],
            nextStepIds: [],
          }),
          buildIteratorStep({
            id: INNER_ID,
            name: 'Inner',
            initialLoopStepIds: [INNER_STEP_ID],
            nextStepIds: innerIteratorNextStepIds,
          }),
          buildStep({
            id: INNER_STEP_ID,
            name: 'Inner step',
            nextStepIds: [INNER_ID],
          }),
        ]);

      expect(
        validateWorkflowStructure(buildNestedLoops([OUTER_ID])).errors,
      ).toEqual([]);
      expect(validateWorkflowStructure(buildNestedLoops([])).errors).toEqual([
        expect.objectContaining({
          code: 'ITERATOR_MISSING_RETURN',
          stepId: INNER_ID,
        }),
      ]);
    });
  });
});
