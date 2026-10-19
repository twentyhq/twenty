import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFindRecordsFilterValueIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-find-records-filter-value-issues.util';
import { type WorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'field-stage': {
      id: 'field-stage',
      name: 'stage',
      type: FieldMetadataType.SELECT,
    },
  },
  universalIdentifierById: { 'field-stage': 'field-stage' },
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildFindRecordsStep = (value: string): WorkflowFindRecordsAction =>
  ({
    id: 'step-1',
    name: 'Find Opportunities',
    type: WorkflowActionType.FIND_RECORDS,
    settings: {
      input: {
        objectName: 'opportunity',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'field-stage',
              operand: ViewFilterOperand.IS,
              value,
            },
          ],
        },
      },
    },
  }) as unknown as WorkflowFindRecordsAction;

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
