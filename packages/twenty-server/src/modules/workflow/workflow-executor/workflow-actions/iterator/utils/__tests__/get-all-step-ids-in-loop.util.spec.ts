import { type StepIfElseBranch } from 'twenty-shared/workflow';

import { type WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { type WorkflowIfElseActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-action-settings.type';
import { type WorkflowIteratorActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowCodeAction,
  type WorkflowIfElseAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('getAllStepIdsInLoop', () => {
  const createCodeMockStep = (
    id: string,
    nextStepIds: string[],
  ): WorkflowCodeAction => ({
    id,
    name: `Step ${id}`,
    type: WorkflowActionType.CODE,
    valid: true,
    nextStepIds,
    settings: {
      input: {},
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
    } as WorkflowCodeActionSettings,
  });

  const createIteratorMockStep = (
    id: string,
    nextStepIds: string[],
    initialLoopStepIds: string[],
  ): WorkflowIteratorAction => ({
    id,
    name: `Step ${id}`,
    type: WorkflowActionType.ITERATOR,
    valid: true,
    nextStepIds,
    settings: {
      input: (initialLoopStepIds
        ? ({ initialLoopStepIds } as WorkflowIteratorActionInput)
        : {}) as WorkflowIteratorActionInput,
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
    },
  });

  const createIfElseMockStep = (
    id: string,
    branches: StepIfElseBranch[],
    nextStepIds: string[] = [],
  ): WorkflowIfElseAction => ({
    id,
    name: `Step ${id}`,
    type: WorkflowActionType.IF_ELSE,
    valid: true,
    nextStepIds,
    settings: {
      input: {
        stepFilterGroups: [],
        stepFilters: [],
        branches,
      },
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
    } as WorkflowIfElseActionSettings,
  });

  describe('simple loop scenarios', () => {
    it('should return all step IDs in a simple linear loop', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
        createCodeMockStep('step2', ['step3']),
        createCodeMockStep('step3', ['step4']),
        createCodeMockStep('step4', ['iterator1']), // loops back
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2'],
        steps,
      });

      expect(result).toEqual(['step2', 'step3', 'step4']);
    });

    it('should handle loop with branching paths that converge', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
        createCodeMockStep('step2', ['step3', 'step4']),
        createCodeMockStep('step3', ['step5']),
        createCodeMockStep('step4', ['step5']),
        createCodeMockStep('step5', ['iterator1']), // loops back
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2'],
        steps,
      });

      expect(result).toEqual(['step2', 'step3', 'step5', 'step4']);
    });

    it('should handle loop with branching paths that converge to the iterator', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
        createCodeMockStep('step2', ['step3', 'step4']),
        createCodeMockStep('step3', ['iterator1']),
        createCodeMockStep('step4', ['iterator1']),
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2'],
        steps,
      });

      expect(result).toEqual(['step2', 'step3', 'step4']);
    });

    it('should handle multiple entry points to the loop', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2', 'step3'], []),
        createCodeMockStep('step2', ['step4']),
        createCodeMockStep('step3', ['step4']),
        createCodeMockStep('step4', ['iterator1']), // loops back
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2', 'step3'],
        steps,
      });

      expect(result).toEqual(['step2', 'step4', 'step3']);
    });
  });

  describe('nested iterator scenarios', () => {
    it('should handle a nested iterator within a loop', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
        createCodeMockStep('step2', ['nested_iterator']),
        createIteratorMockStep('nested_iterator', ['step5'], ['step3']),
        createCodeMockStep('step3', ['step4']),
        createCodeMockStep('step4', ['nested_iterator']), // loops back to nested iterator
        createCodeMockStep('step5', ['iterator1']), // loops back to main iterator
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2'],
        steps,
      });

      expect(result).toEqual([
        'step2',
        'nested_iterator',
        'step3',
        'step4',
        'step5',
      ]);
    });

    it('should handle multiple levels of nested iterators', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
        createCodeMockStep('step2', ['nested_iterator1']),
        createIteratorMockStep('nested_iterator1', ['step6'], ['step3']),
        createCodeMockStep('step3', ['nested_iterator2']),
        createIteratorMockStep('nested_iterator2', ['step5'], ['step4']),
        createCodeMockStep('step4', ['nested_iterator2']), // loops back to nested iterator2
        createCodeMockStep('step5', ['nested_iterator1']), // loops back to nested iterator1
        createCodeMockStep('step6', ['iterator1']), // loops back to main iterator
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2'],
        steps,
      });

      expect(result).toEqual([
        'step2',
        'nested_iterator1',
        'step3',
        'nested_iterator2',
        'step4',
        'step5',
        'step6',
      ]);
    });
  });

  describe('if-else scenarios', () => {
    it('should include steps in all if-else branches within a loop', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', [], ['ifElse1']),
        createIfElseMockStep('ifElse1', [
          { id: 'branch-if', filterGroupId: 'fg1', nextStepIds: ['stepA'] },
          { id: 'branch-else', nextStepIds: ['stepB'] },
        ]),
        createCodeMockStep('stepA', ['iterator1']),
        createCodeMockStep('stepB', ['iterator1']),
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['ifElse1'],
        steps,
      });

      expect(result).toEqual(
        expect.arrayContaining(['ifElse1', 'stepA', 'stepB']),
      );
      expect(result).toHaveLength(3);
    });

    it('should include deeply nested steps inside if-else branches', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', [], ['ifElse1']),
        createIfElseMockStep('ifElse1', [
          { id: 'branch-if', filterGroupId: 'fg1', nextStepIds: ['stepA'] },
          { id: 'branch-else', nextStepIds: ['stepB'] },
        ]),
        createCodeMockStep('stepA', ['stepC']),
        createCodeMockStep('stepB', ['stepC']),
        createCodeMockStep('stepC', ['iterator1']),
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['ifElse1'],
        steps,
      });

      expect(result).toEqual(
        expect.arrayContaining(['ifElse1', 'stepA', 'stepB', 'stepC']),
      );
      expect(result).toHaveLength(4);
    });

    it('should handle if-else with steps before and after within a loop', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', [], ['step1']),
        createCodeMockStep('step1', ['ifElse1']),
        createIfElseMockStep('ifElse1', [
          { id: 'branch-if', filterGroupId: 'fg1', nextStepIds: ['stepA'] },
          { id: 'branch-else', nextStepIds: ['stepB'] },
        ]),
        createCodeMockStep('stepA', ['step2']),
        createCodeMockStep('stepB', ['step2']),
        createCodeMockStep('step2', ['iterator1']),
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step1'],
        steps,
      });

      expect(result).toEqual(
        expect.arrayContaining(['step1', 'ifElse1', 'stepA', 'stepB', 'step2']),
      );
      expect(result).toHaveLength(5);
    });
  });

  describe('edge cases', () => {
    it('should handle empty initial loop step IDs', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: [],
        steps,
      });

      expect(result).toEqual([]);
    });

    it('should handle steps with no nextStepIds', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
        createCodeMockStep('step2', []), // no nextStepIds
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2'],
        steps,
      });

      expect(result).toEqual(['step2']);
    });

    it('should prevent infinite loops with circular references', () => {
      const steps: WorkflowAction[] = [
        createIteratorMockStep('iterator1', ['step2'], []),
        createCodeMockStep('step2', ['step3']),
        createCodeMockStep('step3', ['step4']),
        createCodeMockStep('step4', ['step2']), // circular reference
      ];

      const result = getAllStepIdsInLoop({
        iteratorStepId: 'iterator1',
        initialLoopStepIds: ['step2'],
        steps,
      });

      // Should still include all steps but not get stuck in infinite loop
      expect(result).toEqual(['step2', 'step3', 'step4']);
    });
  });
});
