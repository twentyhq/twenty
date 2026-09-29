import { FieldMetadataType } from 'twenty-shared/types';

import { fromWorkflowStepManifestToActionOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-step-manifest-to-action-or-throw.util';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getWorkflowVersionReferenceApplicationIds } from 'src/engine/workspace-manager/workspace-migration/services/utils/get-workflow-version-reference-application-ids.util';

const OBJECT_ID = '11111111-1111-4111-8111-111111111111';
const STEP_ID = '22222222-2222-4222-8222-222222222222';

const buildArgs = (isSystemSideEffect = true) => {
  const maps = createEmptyAllFlatEntityMaps();
  maps.flatObjectMetadataMaps.byUniversalIdentifier[OBJECT_ID] =
    getFlatObjectMetadataMock({
      universalIdentifier: OBJECT_ID,
      nameSingular: 'externalRecord',
      applicationId: 'object-owner',
    });
  maps.flatFieldMetadataMaps.byUniversalIdentifier.field =
    getFlatFieldMetadataMock({
      universalIdentifier: 'field',
      objectMetadataId: 'object',
      objectMetadataUniversalIdentifier: OBJECT_ID,
      type: FieldMetadataType.TEXT,
      applicationId: 'field-owner',
    });
  const step = fromWorkflowStepManifestToActionOrThrow({
    step: {
      universalIdentifier: STEP_ID,
      name: 'Create',
      type: 'CREATE_RECORD',
      input: { objectUniversalIdentifier: OBJECT_ID, objectRecord: {} },
      nextStepIds: [],
    },
    index: 0,
    references: {
      logicFunctionIdByUniversalIdentifier: new Map(),
      objectByUniversalIdentifier: new Map([
        [OBJECT_ID, { nameSingular: 'externalRecord' }],
      ]),
    },
  });
  return {
    flatObjectMetadataMaps: maps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: maps.flatFieldMetadataMaps,
    workflowVersionOperations: {
      flatEntityToCreate: {
        version: {
          universalIdentifier: 'version',
          applicationUniversalIdentifier: 'workflow-owner',
          isSystemSideEffect,
          steps: [step],
          triggers: null,
          status: WorkflowVersionStatus.ACTIVE,
          coreWorkflowId: 'workflow',
          workflowId: null,
          workspaceWorkflowVersionId: null,
          createdAt: '',
          updatedAt: '',
        },
      },
      flatEntityToUpdate: {},
      flatEntityToDelete: {},
    },
  };
};

describe('getWorkflowVersionReferenceApplicationIds', () => {
  it('includes external object owners and applications extending their fields', () => {
    expect(getWorkflowVersionReferenceApplicationIds(buildArgs())).toEqual([
      'object-owner',
      'field-owner',
    ]);
  });

  it('does not change dependency collection for ordinary API versions', () => {
    expect(getWorkflowVersionReferenceApplicationIds(buildArgs(false))).toEqual(
      [],
    );
  });
});
