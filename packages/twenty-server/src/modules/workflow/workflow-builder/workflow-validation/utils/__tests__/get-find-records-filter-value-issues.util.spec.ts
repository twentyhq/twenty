import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFindRecordsFilterValueIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-find-records-filter-value-issues.util';
import { type WorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const STAGE_FIELD_ID = '22222222-2222-4222-8222-222222222222';

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatFieldMetadataMock({
    id: STAGE_FIELD_ID,
    universalIdentifier: STAGE_FIELD_ID,
    objectMetadataId: '33333333-3333-4333-8333-333333333333',
    type: FieldMetadataType.SELECT,
    name: 'stage',
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const buildFindRecordsStep = (value: string): WorkflowFindRecordsAction => ({
  id: 'step-1',
  name: 'Find Opportunities',
  type: WorkflowActionType.FIND_RECORDS,
  valid: true,
  settings: {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
    input: {
      objectName: 'opportunity',
      filter: {
        recordFilters: [
          {
            fieldMetadataId: STAGE_FIELD_ID,
            operand: ViewFilterOperand.IS,
            value,
          },
        ],
      },
    },
  },
});

describe('getFindRecordsFilterValueIssues', () => {
  it('accepts a stringified array of options', () => {
    expect(
      getFindRecordsFilterValueIssues({
        step: buildFindRecordsStep('["WON"]'),
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });

  it('flags a bare option value on a select field', () => {
    expect(
      getFindRecordsFilterValueIssues({
        step: buildFindRecordsStep('WON'),
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      expect.objectContaining({
        code: 'INVALID_RECORD_FILTER_VALUE',
        stepId: 'step-1',
      }),
    ]);
  });

  it('skips values holding a variable', () => {
    expect(
      getFindRecordsFilterValueIssues({
        step: buildFindRecordsStep('{{trigger.object.stage}}'),
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });
});
