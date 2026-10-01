import { findChangedApplicationWorkflowDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/find-changed-application-workflow-dependencies.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';

const greet = {
  id: 'greet-id',
  universalIdentifier: 'greet-uid',
  name: 'greet',
  checksum: 'checksum-1',
  handlerName: 'main',
  runtime: 'nodejs22.x',
  workflowActionTriggerSettings: {},
  description: null,
};

const summarizer = {
  id: 'summarizer-id',
  universalIdentifier: 'summarizer-uid',
  label: 'Summarizer',
  prompt: 'You summarize',
  modelId: 'auto',
  responseFormat: { type: 'text' },
  modelConfiguration: null,
  description: null,
};

const fromAllFlatEntityMaps = {
  flatWorkflowMaps: {
    byUniversalIdentifier: {
      'workflow-uid': {
        id: 'workflow-id',
        universalIdentifier: 'workflow-uid',
      },
    },
  },
  flatLogicFunctionMaps: { byUniversalIdentifier: { 'greet-uid': greet } },
  flatAgentMaps: { byUniversalIdentifier: { 'summarizer-uid': summarizer } },
} as unknown as Pick<
  AllFlatEntityMaps,
  'flatWorkflowMaps' | 'flatLogicFunctionMaps' | 'flatAgentMaps'
>;

const operationRecord = (
  record: Record<string, unknown>,
): AllFlatEntityOperationRecordByMetadataName =>
  record as AllFlatEntityOperationRecordByMetadataName;

describe('findChangedApplicationWorkflowDependencies', () => {
  it('reports nothing when the update keeps the executed definitions', () => {
    const changes = findChangedApplicationWorkflowDependencies({
      fromAllFlatEntityMaps,
      shouldBlockLogicFunctionUpdates: true,
      flatEntityOperationRecordByMetadataName: operationRecord({
        logicFunction: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {
            'greet-uid': { ...greet, description: 'Greets people' },
          },
          flatEntityToDelete: {},
        },
        agent: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {
            'summarizer-uid': { ...summarizer, description: 'Summaries' },
          },
          flatEntityToDelete: {},
        },
      }),
    });

    expect(changes.removedWorkflowIds.size).toBe(0);
    expect(changes.changedLogicFunctionDescriptionById.size).toBe(0);
    expect(changes.changedAgentDescriptionById.size).toBe(0);
  });

  it('reports changed and removed functions, agents and workflows by id', () => {
    const changes = findChangedApplicationWorkflowDependencies({
      fromAllFlatEntityMaps,
      shouldBlockLogicFunctionUpdates: true,
      flatEntityOperationRecordByMetadataName: operationRecord({
        workflow: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {},
          flatEntityToDelete: { 'workflow-uid': {} },
        },
        logicFunction: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {
            'greet-uid': { ...greet, checksum: 'checksum-2' },
          },
          flatEntityToDelete: {},
        },
        agent: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {},
          flatEntityToDelete: { 'summarizer-uid': summarizer },
        },
      }),
    });

    expect([...changes.removedWorkflowIds]).toEqual(['workflow-id']);
    expect([...changes.changedLogicFunctionDescriptionById]).toEqual([
      ['greet-id', 'logic function "greet", which this update changes'],
    ]);
    expect([...changes.changedAgentDescriptionById]).toEqual([
      ['summarizer-id', 'agent "Summarizer", which this update removes'],
    ]);
  });

  it('lets function updates through once new bundles may already be stored, but still reports removals', () => {
    const changes = findChangedApplicationWorkflowDependencies({
      fromAllFlatEntityMaps,
      shouldBlockLogicFunctionUpdates: false,
      flatEntityOperationRecordByMetadataName: operationRecord({
        logicFunction: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {
            'greet-uid': { ...greet, checksum: 'checksum-2' },
          },
          flatEntityToDelete: {},
        },
        agent: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {},
          flatEntityToDelete: { 'summarizer-uid': summarizer },
        },
      }),
    });

    expect(changes.changedLogicFunctionDescriptionById.size).toBe(0);
    expect([...changes.changedAgentDescriptionById]).toEqual([
      ['summarizer-id', 'agent "Summarizer", which this update removes'],
    ]);
  });
});
