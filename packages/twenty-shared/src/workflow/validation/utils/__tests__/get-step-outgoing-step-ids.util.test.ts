import { WORKFLOW_VALIDATION_STEP_TYPES } from '@/workflow/validation/constants/workflow-validation-step-types';
import { type ValidatableWorkflowStep } from '@/workflow/validation/types/workflow-validation.type';
import {
  getStepInput,
  getStepOutgoingStepIds,
} from '../get-step-outgoing-step-ids.util';

describe('getStepInput', () => {
  it('should return the input object when present', () => {
    const step: ValidatableWorkflowStep = {
      id: 'step-1',
      type: 'CODE',
      settings: { input: { foo: 'bar' } },
    };

    expect(getStepInput(step)).toEqual({ foo: 'bar' });
  });

  it('should return undefined when input is missing or not an object', () => {
    expect(getStepInput({ id: 'step-1', type: 'CODE' })).toBeUndefined();
    expect(
      getStepInput({ id: 'step-1', type: 'CODE', settings: { input: 'text' } }),
    ).toBeUndefined();
  });
});

describe('getStepOutgoingStepIds', () => {
  it('should return the nextStepIds of a regular step', () => {
    expect(
      getStepOutgoingStepIds({
        id: 'step-1',
        type: 'CODE',
        nextStepIds: ['a', 'b'],
      }),
    ).toEqual(['a', 'b']);
  });

  it('should deduplicate outgoing step ids', () => {
    expect(
      getStepOutgoingStepIds({
        id: 'step-1',
        type: 'CODE',
        nextStepIds: ['a', 'a'],
      }),
    ).toEqual(['a']);
  });

  it('should include if-else branch nextStepIds', () => {
    const step: ValidatableWorkflowStep = {
      id: 'step-1',
      type: WORKFLOW_VALIDATION_STEP_TYPES.IF_ELSE,
      nextStepIds: ['x'],
      settings: {
        input: { branches: [{ nextStepIds: ['b1'] }, { nextStepIds: ['b2'] }] },
      },
    };

    expect(getStepOutgoingStepIds(step).sort()).toEqual(['b1', 'b2', 'x']);
  });

  it('should include iterator initialLoopStepIds', () => {
    const step: ValidatableWorkflowStep = {
      id: 'step-1',
      type: WORKFLOW_VALIDATION_STEP_TYPES.ITERATOR,
      settings: { input: { initialLoopStepIds: ['loop-1'] } },
    };

    expect(getStepOutgoingStepIds(step)).toEqual(['loop-1']);
  });

  it('should fall back to nextStepIds when input is not an object', () => {
    expect(
      getStepOutgoingStepIds({
        id: 'step-1',
        type: 'CODE',
        nextStepIds: ['a'],
        settings: { input: undefined },
      }),
    ).toEqual(['a']);
  });
});
