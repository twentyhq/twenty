import { getWorkflowVersionUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildWorkflowVersionDeleteSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/build-workflow-version-delete-side-effects.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const WORKFLOW_ID = '22222222-2222-4222-8222-222222222222';
const VERSION_ID = getWorkflowVersionUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_ID,
  workflowUniversalIdentifier: WORKFLOW_ID,
});

const deletedWorkflow = {
  universalIdentifier: WORKFLOW_ID,
  applicationUniversalIdentifier: APPLICATION_ID,
} as UniversalFlatWorkflow;

const buildDeleteSideEffects = (isSystemSideEffect: boolean | undefined) => {
  const relatedFlatEntityMaps = createEmptyAllFlatEntityMaps();

  if (isDefined(isSystemSideEffect)) {
    relatedFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
      VERSION_ID
    ] = {
      universalIdentifier: VERSION_ID,
      isSystemSideEffect,
    } as FlatWorkflowVersion;
  }

  return buildWorkflowVersionDeleteSideEffects({
    flatEntity: deletedWorkflow,
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps,
    context: {
      buildOptions: {
        isSystemBuild: false,
        applicationUniversalIdentifier: APPLICATION_ID,
      },
    },
  });
};

describe('buildWorkflowVersionDeleteSideEffects', () => {
  it('deletes the managed version of a deleted application workflow', () => {
    expect(buildDeleteSideEffects(true)).toMatchObject({
      status: 'success',
      operations: {
        workflowVersion: {
          flatEntityToDelete: {
            [VERSION_ID]: { universalIdentifier: VERSION_ID },
          },
        },
      },
    });
  });

  it('leaves workflows without a managed version alone', () => {
    expect(buildDeleteSideEffects(undefined)).toEqual({ status: 'noop' });
    expect(buildDeleteSideEffects(false)).toEqual({ status: 'noop' });
  });
});
