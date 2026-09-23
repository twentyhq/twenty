import { WorkflowActionType } from 'twenty-shared/workflow';

import { remapDuplicatedStepDestinations } from 'src/modules/workflow/workflow-builder/utils/remap-duplicated-step-destinations.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const buildStep = (step: Partial<WorkflowAction> & { id: string }) =>
  ({
    name: 'Step',
    type: WorkflowActionType.CODE,
    valid: true,
    settings: { input: {} },
    position: { x: 0, y: 0 },
    ...step,
  }) as WorkflowAction;

const TRIGGER = {
  name: 'Manual Trigger',
  type: WorkflowTriggerType.MANUAL,
  settings: { outputSchema: {} },
  nextStepIds: ['source-if-else'],
  position: { x: 0, y: 0 },
} as WorkflowTrigger;

describe('remapDuplicatedStepDestinations', () => {
  it('remaps the trigger and plain step destinations', () => {
    const source = buildStep({ id: 'source-a', nextStepIds: ['source-b'] });
    const other = buildStep({ id: 'source-b' });

    const { trigger, steps } = remapDuplicatedStepDestinations({
      trigger: { ...TRIGGER, nextStepIds: ['source-a'] },
      sourceToClonedPairs: [
        { source, duplicated: buildStep({ id: 'cloned-a' }) },
        { source: other, duplicated: buildStep({ id: 'cloned-b' }) },
      ],
      clonedStepIdBySourceStepId: new Map([
        ['source-a', 'cloned-a'],
        ['source-b', 'cloned-b'],
      ]),
    });

    expect(trigger.nextStepIds).toEqual(['cloned-a']);
    expect(steps[0]?.nextStepIds).toEqual(['cloned-b']);
  });

  it('remaps the destinations of connected if/else branches', () => {
    const sourceIfElse = buildStep({
      id: 'source-if-else',
      type: WorkflowActionType.IF_ELSE,
      settings: {
        input: {
          stepFilterGroups: [],
          stepFilters: [],
          branches: [
            {
              id: 'branch-if',
              filterGroupId: 'filter-group',
              nextStepIds: ['source-then'],
            },
            { id: 'branch-else', nextStepIds: ['source-otherwise'] },
          ],
        },
      },
    } as unknown as Partial<WorkflowAction> & { id: string });

    const { steps } = remapDuplicatedStepDestinations({
      trigger: TRIGGER,
      sourceToClonedPairs: [
        {
          source: sourceIfElse,
          duplicated: { ...sourceIfElse, id: 'cloned-if-else' },
        },
        {
          source: buildStep({ id: 'source-then' }),
          duplicated: buildStep({ id: 'cloned-then' }),
        },
        {
          source: buildStep({ id: 'source-otherwise' }),
          duplicated: buildStep({ id: 'cloned-otherwise' }),
        },
      ],
      clonedStepIdBySourceStepId: new Map([
        ['source-if-else', 'cloned-if-else'],
        ['source-then', 'cloned-then'],
        ['source-otherwise', 'cloned-otherwise'],
      ]),
    });

    const branches = (
      steps[0] as unknown as {
        settings: { input: { branches: { nextStepIds: string[] }[] } };
      }
    ).settings.input.branches;

    expect(branches[0]?.nextStepIds).toEqual(['cloned-then']);
    expect(branches[1]?.nextStepIds).toEqual(['cloned-otherwise']);
  });

  it('remaps the initial loop steps of an iterator', () => {
    const sourceIterator = buildStep({
      id: 'source-iterator',
      type: WorkflowActionType.ITERATOR,
      settings: {
        input: { items: [], initialLoopStepIds: ['source-loop-start'] },
      },
    } as unknown as Partial<WorkflowAction> & { id: string });

    const { steps } = remapDuplicatedStepDestinations({
      trigger: TRIGGER,
      sourceToClonedPairs: [
        {
          source: sourceIterator,
          duplicated: { ...sourceIterator, id: 'cloned-iterator' },
        },
      ],
      clonedStepIdBySourceStepId: new Map([
        ['source-iterator', 'cloned-iterator'],
        ['source-loop-start', 'cloned-loop-start'],
      ]),
    });

    const initialLoopStepIds = (
      steps[0] as unknown as {
        settings: { input: { initialLoopStepIds: string[] } };
      }
    ).settings.input.initialLoopStepIds;

    expect(initialLoopStepIds).toEqual(['cloned-loop-start']);
  });

  it('remaps loop back-edges and variable references to cloned steps', () => {
    const sourceFind = buildStep({
      id: 'source-find',
      type: WorkflowActionType.FIND_RECORDS,
      nextStepIds: ['source-iterator'],
    });
    const sourceIterator = buildStep({
      id: 'source-iterator',
      type: WorkflowActionType.ITERATOR,
      settings: {
        input: {
          items: '{{source-find.all}}',
          initialLoopStepIds: ['source-loop'],
        },
      },
    } as unknown as Partial<WorkflowAction> & { id: string });
    const sourceLoop = buildStep({
      id: 'source-loop',
      name: 'Log {{source-iterator.currentItem.id}}',
      nextStepIds: ['source-iterator'],
      settings: {
        input: {
          logicFunctionInput: {
            companyId: '{{source-iterator.currentItem.id}}',
            triggerId: '{{trigger.recordId}}',
          },
        },
      },
    } as unknown as Partial<WorkflowAction> & { id: string });

    const { steps } = remapDuplicatedStepDestinations({
      trigger: { ...TRIGGER, nextStepIds: ['source-find'] },
      sourceToClonedPairs: [
        {
          source: sourceFind,
          duplicated: { ...sourceFind, id: 'cloned-find', nextStepIds: [] },
        },
        {
          source: sourceIterator,
          duplicated: { ...sourceIterator, id: 'cloned-iterator' },
        },
        {
          source: sourceLoop,
          duplicated: { ...sourceLoop, id: 'cloned-loop', nextStepIds: [] },
        },
      ],
      clonedStepIdBySourceStepId: new Map([
        ['source-find', 'cloned-find'],
        ['source-iterator', 'cloned-iterator'],
        ['source-loop', 'cloned-loop'],
      ]),
    });

    const [find, iterator, loop] = steps as unknown as {
      name: string;
      nextStepIds: string[];
      settings: { input: Record<string, unknown> };
    }[];

    expect(find?.nextStepIds).toEqual(['cloned-iterator']);
    expect(iterator?.settings.input).toEqual({
      items: '{{cloned-find.all}}',
      initialLoopStepIds: ['cloned-loop'],
    });
    expect(loop?.name).toBe('Log {{source-iterator.currentItem.id}}');
    expect(loop?.nextStepIds).toEqual(['cloned-iterator']);
    expect(loop?.settings.input).toEqual({
      logicFunctionInput: {
        companyId: '{{cloned-iterator.currentItem.id}}',
        triggerId: '{{trigger.recordId}}',
      },
    });
  });
});
