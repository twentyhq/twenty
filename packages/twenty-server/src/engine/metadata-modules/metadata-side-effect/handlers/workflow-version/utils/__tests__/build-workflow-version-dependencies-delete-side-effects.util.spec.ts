import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { buildWorkflowVersionDependenciesDeleteSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow-version/utils/build-workflow-version-dependencies-delete-side-effects.util';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

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
    },
    {
      id: 'active-version-id',
      universalIdentifier: 'active-version',
      coreWorkflowId: 'workflow-id',
      workspaceWorkflowVersionId: null,
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

describe('buildWorkflowVersionDependenciesDeleteSideEffects', () => {
  it('deletes the command menu items of a deleted version', () => {
    const result = deleteDraftVersion({
      workflowVersion: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {},
        flatEntityToDelete: {
          'draft-version': {} as UniversalFlatWorkflowVersion,
        },
      },
    });

    if (result.status !== 'success') {
      throw new Error(`Expected success, got ${result.status}`);
    }

    expect(
      Object.keys(result.operations.commandMenuItem?.flatEntityToDelete ?? {}),
    ).toEqual(['draft-item', 'mirror-draft-item']);
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
