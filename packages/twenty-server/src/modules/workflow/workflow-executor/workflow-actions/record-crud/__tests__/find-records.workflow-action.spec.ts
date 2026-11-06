import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { FindRecordsWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const OBJECT_ID = '30000000-0000-4000-8000-000000000000';
const CLOSE_DATE_FIELD_ID = '30000000-0000-4000-8000-000000000001';

const closeDateField = getFlatFieldMetadataMock({
  id: CLOSE_DATE_FIELD_ID,
  universalIdentifier: CLOSE_DATE_FIELD_ID,
  objectMetadataId: OBJECT_ID,
  name: 'closeDate',
  type: FieldMetadataType.DATE_TIME,
});

const flatObjectMetadata = getFlatObjectMetadataMock({
  id: OBJECT_ID,
  universalIdentifier: OBJECT_ID,
  nameSingular: 'opportunity',
  fieldIds: [CLOSE_DATE_FIELD_ID],
});

const findRecordsStep = (orderBy: unknown) =>
  ({
    id: 'find-step',
    name: 'Find opportunities',
    type: WorkflowActionType.FIND_RECORDS,
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
      input: { objectName: 'opportunity', limit: 1, orderBy },
    },
  }) as unknown as WorkflowAction;

describe('FindRecordsWorkflowAction', () => {
  const execute = jest.fn();

  const action = new FindRecordsWorkflowAction(
    { execute } as unknown as FindRecordsService,
    {
      getExecutionContext: jest.fn().mockResolvedValue({ authContext: {} }),
    } as unknown as WorkflowExecutionContextService,
    {
      getObjectMetadataInfo: jest.fn().mockResolvedValue({
        flatObjectMetadata,
        flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatObjectMetadata,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
        flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: closeDateField,
          flatEntityMaps:
            createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
        }),
      }),
    } as unknown as WorkflowCommonWorkspaceService,
  );

  const run = (orderBy: unknown) =>
    action.execute({
      currentStepId: 'find-step',
      steps: [findRecordsStep(orderBy)],
      context: {},
      runInfo: { workspaceId: 'workspace-id' } as never,
    });

  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValue({
      success: true,
      result: { records: [], count: 0 },
    });
  });

  it('sorts by the order computed from the record sorts', async () => {
    await run({
      recordSorts: [
        { fieldMetadataId: CLOSE_DATE_FIELD_ID, direction: 'DESC' },
      ],
    });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ closeDate: 'DescNullsLast' }] }),
    );
  });

  it('leaves the order to the query without record sorts', async () => {
    await run(undefined);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: undefined }),
    );
  });

  it('fails the step when a sorted field no longer exists', async () => {
    await expect(
      run({ recordSorts: [{ fieldMetadataId: 'deleted', direction: 'ASC' }] }),
    ).rejects.toThrow('Sort could not be computed');
  });
});
