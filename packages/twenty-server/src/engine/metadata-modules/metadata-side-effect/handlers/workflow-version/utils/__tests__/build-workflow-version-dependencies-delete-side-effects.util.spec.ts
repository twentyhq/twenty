import { WorkflowActionType } from 'twenty-shared/workflow';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { buildWorkflowVersionDependenciesDeleteSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow-version/utils/build-workflow-version-dependencies-delete-side-effects.util';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

const DRAFT_FUNCTION_ID = '11111111-1111-4111-8111-111111111111';
const ACTIVE_FUNCTION_ID = '22222222-2222-4222-8222-222222222222';
const SIBLING_FUNCTION_ID = '33333333-3333-4333-8333-333333333333';
const APPLICATION_FUNCTION_ID = '44444444-4444-4444-8444-444444444444';

const step = (
  type: WorkflowActionType.CODE | WorkflowActionType.LOGIC_FUNCTION,
  logicFunctionId: string,
) => ({
  id: `step-${type}-${logicFunctionId}`,
  name: 'Step',
  type,
  valid: true,
  nextStepIds: [],
  settings: { input: { logicFunctionId } },
});

const buildMaps = () => {
  const maps = createEmptyAllFlatEntityMaps();

  maps.flatWorkflowMaps.byUniversalIdentifier['workflow'] = {
    id: 'workflow-id',
    universalIdentifier: 'workflow',
  } as FlatWorkflow;

  const versions = [
    {
      id: 'draft-version-id',
      universalIdentifier: 'draft-version',
      coreWorkflowId: 'workflow-id',
      workspaceWorkflowVersionId: 'mirror-draft-version-id',
      steps: [
        step(WorkflowActionType.CODE, DRAFT_FUNCTION_ID),
        step(WorkflowActionType.CODE, ACTIVE_FUNCTION_ID),
        step(WorkflowActionType.CODE, SIBLING_FUNCTION_ID),
        step(WorkflowActionType.LOGIC_FUNCTION, APPLICATION_FUNCTION_ID),
      ],
    },
    {
      id: 'active-version-id',
      universalIdentifier: 'active-version',
      coreWorkflowId: 'workflow-id',
      workspaceWorkflowVersionId: null,
      steps: [step(WorkflowActionType.CODE, ACTIVE_FUNCTION_ID)],
    },
    {
      id: 'sibling-version-id',
      universalIdentifier: 'sibling-version',
      coreWorkflowId: 'workflow-id',
      workspaceWorkflowVersionId: null,
      steps: [step(WorkflowActionType.CODE, SIBLING_FUNCTION_ID)],
    },
  ];

  for (const version of versions) {
    maps.flatWorkflowVersionMaps.byUniversalIdentifier[
      version.universalIdentifier
    ] = version as unknown as FlatWorkflowVersion;
  }

  const commandMenuItems = [
    {
      universalIdentifier: 'draft-item',
      coreWorkflowVersionId: 'draft-version-id',
      workflowVersionId: null,
    },
    {
      universalIdentifier: 'mirror-draft-item',
      coreWorkflowVersionId: null,
      workflowVersionId: 'mirror-draft-version-id',
    },
    {
      universalIdentifier: 'active-item',
      coreWorkflowVersionId: 'active-version-id',
      workflowVersionId: null,
    },
  ];

  for (const commandMenuItem of commandMenuItems) {
    maps.flatCommandMenuItemMaps.byUniversalIdentifier[
      commandMenuItem.universalIdentifier
    ] = commandMenuItem as FlatCommandMenuItem;
  }

  for (const logicFunctionId of [
    DRAFT_FUNCTION_ID,
    ACTIVE_FUNCTION_ID,
    SIBLING_FUNCTION_ID,
    APPLICATION_FUNCTION_ID,
  ]) {
    maps.flatLogicFunctionMaps.byUniversalIdentifier[logicFunctionId] = {
      id: logicFunctionId,
      universalIdentifier: logicFunctionId,
    } as FlatLogicFunction;
  }

  return maps;
};

const deleteDraftVersion = (
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName,
) =>
  buildWorkflowVersionDependenciesDeleteSideEffects({
    flatEntity: {
      universalIdentifier: 'draft-version',
    } as UniversalFlatWorkflowVersion,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: buildMaps(),
    context: {
      buildOptions: {
        isSystemBuild: false,
        applicationUniversalIdentifier: 'application',
      },
    },
  });

const getDeletedUniversalIdentifiers = (
  result: ReturnType<typeof deleteDraftVersion>,
) => {
  if (result.status !== 'success') {
    throw new Error(`Expected success, got ${result.status}`);
  }

  return {
    commandMenuItem: Object.keys(
      result.operations.commandMenuItem?.flatEntityToDelete ?? {},
    ),
    logicFunction: Object.keys(
      result.operations.logicFunction?.flatEntityToDelete ?? {},
    ),
  };
};

describe('buildWorkflowVersionDependenciesDeleteSideEffects', () => {
  it('deletes the command menu items of a deleted version and the CODE functions no surviving version uses', () => {
    expect(
      getDeletedUniversalIdentifiers(
        deleteDraftVersion({
          workflowVersion: {
            flatEntityToCreate: {},
            flatEntityToUpdate: {},
            flatEntityToDelete: {
              'draft-version': {} as UniversalFlatWorkflowVersion,
            },
          },
        }),
      ),
    ).toEqual({
      commandMenuItem: ['draft-item', 'mirror-draft-item'],
      logicFunction: [DRAFT_FUNCTION_ID],
    });
  });

  it('deletes CODE functions shared with versions deleted in the same migration', () => {
    expect(
      getDeletedUniversalIdentifiers(
        deleteDraftVersion({
          workflowVersion: {
            flatEntityToCreate: {},
            flatEntityToUpdate: {},
            flatEntityToDelete: {
              'draft-version': {} as UniversalFlatWorkflowVersion,
              'sibling-version': {} as UniversalFlatWorkflowVersion,
            },
          },
        }),
      ).logicFunction,
    ).toEqual([DRAFT_FUNCTION_ID, SIBLING_FUNCTION_ID]);
  });

  it('leaves the cleanup to the workflow when the workflow is deleted in the same migration', () => {
    expect(
      deleteDraftVersion({
        workflow: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {},
          flatEntityToDelete: { workflow: {} as UniversalFlatWorkflow },
        },
      }),
    ).toEqual({ status: 'noop' });
  });
});
