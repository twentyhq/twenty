import { Test, type TestingModule } from '@nestjs/testing';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import {
  type ObjectMetadataInfo,
  WorkflowCommonWorkspaceService,
} from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { UpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/update-record.workflow-action';
import { type WorkflowUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const PERSON_OBJECT_METADATA_ID = 'person-object-metadata-id';
const PERSON_ID = '0f5e8a9c-0000-4000-8000-000000000001';
const COMPANY_ID = '0f5e8a9c-0000-4000-8000-000000000002';

const personFieldFlatMetadatas = [
  getFlatFieldMetadataMock({
    id: 'job-title-field-metadata-id',
    objectMetadataId: PERSON_OBJECT_METADATA_ID,
    universalIdentifier: 'job-title-field-universal-identifier',
    name: 'jobTitle',
    type: FieldMetadataType.TEXT,
  }),
  getFlatFieldMetadataMock({
    id: 'company-field-metadata-id',
    objectMetadataId: PERSON_OBJECT_METADATA_ID,
    universalIdentifier: 'company-field-universal-identifier',
    name: 'company',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
    relationTargetObjectMetadataId: 'company-object-metadata-id',
  }),
];

const personFlatObjectMetadata = getFlatObjectMetadataMock({
  id: PERSON_OBJECT_METADATA_ID,
  universalIdentifier: 'person-object-universal-identifier',
  nameSingular: 'person',
  namePlural: 'people',
  fieldIds: personFieldFlatMetadatas.map(({ id }) => id),
});

const objectMetadataInfo: ObjectMetadataInfo = {
  flatObjectMetadata: personFlatObjectMetadata,
  flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: personFieldFlatMetadatas,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
  flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [personFlatObjectMetadata],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
};

const buildUpdateStep = (
  input: Omit<WorkflowUpdateRecordActionInput, 'objectName' | 'objectRecordId'>,
): WorkflowAction => ({
  id: 'update-step',
  name: 'Update Person',
  type: WorkflowActionType.UPDATE_RECORD,
  valid: true,
  settings: {
    input: { objectName: 'person', objectRecordId: PERSON_ID, ...input },
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: 0 },
    },
  },
});

describe('UpdateRecordWorkflowAction', () => {
  const executeUpdateRecord = jest
    .fn()
    .mockResolvedValue({ success: true, result: {} });

  let workflowAction: UpdateRecordWorkflowAction;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRecordWorkflowAction,
        {
          provide: UpdateRecordService,
          useValue: { execute: executeUpdateRecord },
        },
        {
          provide: WorkflowExecutionContextService,
          useValue: {
            getExecutionContext: jest.fn().mockResolvedValue({
              isActingOnBehalfOfUser: false,
              authContext: {},
            }),
          },
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: {
            getObjectMetadataInfo: jest
              .fn()
              .mockResolvedValue(objectMetadataInfo),
          },
        },
      ],
    }).compile();

    workflowAction = module.get(UpdateRecordWorkflowAction);
  });

  const execute = (step: WorkflowAction) =>
    workflowAction.execute({
      currentStepId: step.id,
      steps: [step],
      context: {},
      runInfo: {
        workspaceId: 'workspace-id',
        workflowRunId: 'workflow-run-id',
      },
    });

  beforeEach(() => {
    executeUpdateRecord.mockClear();
  });

  it.each([
    ['its field name', 'company'],
    ['its join column', 'companyId'],
  ])('updates a relation selected by %s', async (_, fieldReference) => {
    await execute(
      buildUpdateStep({
        objectRecord: { company: { id: COMPANY_ID }, jobTitle: 'CTO' },
        fieldsToUpdate: [fieldReference, 'jobTitle'],
      }),
    );

    expect(executeUpdateRecord).toHaveBeenCalledTimes(1);
    expect(executeUpdateRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectRecord: { companyId: COMPANY_ID, jobTitle: 'CTO' },
        fieldsToUpdate: ['companyId', 'jobTitle'],
      }),
    );
  });

  it('updates a relation set by its join column and selected by its field name', async () => {
    await execute(
      buildUpdateStep({
        objectRecord: { companyId: COMPANY_ID },
        fieldsToUpdate: ['company'],
      }),
    );

    expect(executeUpdateRecord).toHaveBeenCalledTimes(1);
    expect(executeUpdateRecord).toHaveBeenCalledWith(
      expect.objectContaining({ fieldsToUpdate: ['companyId'] }),
    );
  });

  it('refuses to run when no selected field has a value', async () => {
    await expect(
      execute(
        buildUpdateStep({
          objectRecord: { jobTitle: 'CTO' },
          fieldsToUpdate: ['company'],
        }),
      ),
    ).rejects.toThrow('Failed to update: No fields to update');

    expect(executeUpdateRecord).not.toHaveBeenCalled();
  });
});
