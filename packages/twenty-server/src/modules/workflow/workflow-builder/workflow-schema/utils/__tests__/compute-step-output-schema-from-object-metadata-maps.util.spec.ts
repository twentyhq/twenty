import {
  buildManualTriggerMetadataNode,
  WORKFLOW_TRIGGER_METADATA_KEY,
  WORKFLOW_TRIGGER_PAYLOAD_KEY,
} from 'twenty-shared/workflow';

import {
  getMockObjectMetadataInfo,
  mockFlatFieldMetadataMaps,
  mockFlatObjectMetadataMaps,
  mockObjectIdByNameSingular,
} from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import { computeStepOutputSchemaFromObjectMetadataMaps } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-step-output-schema-from-object-metadata-maps.util';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const objectMetadataMaps = {
  flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
  flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
  objectIdByNameSingular: mockObjectIdByNameSingular,
};

const companyRecordSchema = generateFakeObjectRecord({
  objectMetadataInfo: getMockObjectMetadataInfo('company'),
});

const manualTrigger = (availability?: object) =>
  ({
    name: 'Manual trigger',
    type: 'MANUAL',
    settings: { outputSchema: {}, availability },
  }) as WorkflowTrigger;

const action = (type: string, input: unknown, id = 'step') =>
  ({
    id,
    name: type,
    type,
    valid: true,
    settings: { input, outputSchema: {} },
  }) as WorkflowAction;

const compute = (
  step: WorkflowTrigger | WorkflowAction,
  workflowVersionContent?: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  },
) =>
  computeStepOutputSchemaFromObjectMetadataMaps({
    step,
    objectMetadataMaps,
    workflowVersionContent,
  });

describe('computeStepOutputSchemaFromObjectMetadataMaps', () => {
  it('describes the manual trigger metadata for a global availability', () => {
    expect(compute(manualTrigger({ type: 'GLOBAL' }))).toEqual({
      [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
    });
  });

  it('describes the selected record for a single record availability', () => {
    expect(
      compute(
        manualTrigger({
          type: 'SINGLE_RECORD',
          objectNameSingular: 'company',
        }),
      ),
    ).toEqual({
      [WORKFLOW_TRIGGER_PAYLOAD_KEY]: expect.objectContaining({
        value: companyRecordSchema,
      }),
      [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
    });
  });

  it('describes the selected records for a bulk records availability', () => {
    expect(
      compute(
        manualTrigger({
          type: 'BULK_RECORDS',
          objectNameSingular: 'company',
        }),
      ),
    ).toMatchObject({
      [WORKFLOW_TRIGGER_PAYLOAD_KEY]: {
        value: {
          companies: { isLeaf: true, type: 'array', label: 'Companies' },
        },
      },
    });
  });

  it('describes nothing for a manual trigger without availability', () => {
    expect(compute(manualTrigger())).toEqual({});
  });

  it.each([
    'CREATE_RECORD',
    'UPDATE_RECORD',
    'DELETE_RECORD',
    'UPSERT_RECORD',
    'PICK_RECORD',
  ])('describes the record of a %s step', (type) => {
    expect(compute(action(type, { objectName: 'company' }))).toEqual(
      companyRecordSchema,
    );
  });

  it('describes the first record, all records and count of a find records step', () => {
    expect(
      compute(action('FIND_RECORDS', { objectName: 'company' })),
    ).toMatchObject({
      first: { label: 'First Company', value: companyRecordSchema },
      all: { label: 'All Companies', type: 'array' },
      totalCount: { type: 'number' },
    });
  });

  it('describes record form fields with their object record', () => {
    expect(
      compute(
        action('FORM', [
          {
            id: 'form-field',
            name: 'company',
            label: 'Company',
            type: 'RECORD',
            settings: { objectName: 'company' },
          },
        ]),
      ),
    ).toEqual({
      company: { isLeaf: false, label: 'Company', value: companyRecordSchema },
    });
  });

  it('describes the previous record and updated fields when waiting for an update', () => {
    expect(
      Object.keys(
        compute(action('WAIT_FOR_EVENT', { eventName: 'company.updated' })),
      ),
    ).toEqual(['record', 'recordId', 'before', 'updatedFields', 'hasTimedOut']);
    expect(
      Object.keys(
        compute(action('WAIT_FOR_EVENT', { eventName: 'company.created' })),
      ),
    ).toEqual(['record', 'recordId', 'hasTimedOut']);
    expect(
      compute(action('WAIT_FOR_EVENT', { eventName: 'not an event' })),
    ).toEqual({});
  });

  it('describes the iterated record when looping over found records', () => {
    const findRecords = action(
      'FIND_RECORDS',
      { objectName: 'company' },
      'find-companies',
    );

    expect(
      compute(action('ITERATOR', { items: '{{find-companies.all}}' }), {
        trigger: null,
        steps: [findRecords],
      }),
    ).toMatchObject({
      currentItem: {
        label: 'Current Item (Company)',
        value: companyRecordSchema,
      },
      currentItemIndex: { type: 'number' },
      hasProcessedAllItems: { type: 'boolean' },
    });
  });

  it('falls back to an unknown current item when the iterated items are not set', () => {
    expect(compute(action('ITERATOR', {})).currentItem).toEqual(
      DEFAULT_ITERATOR_CURRENT_ITEM,
    );
  });

  it('rejects a step on an object the workspace does not have', () => {
    expect(() =>
      compute(action('CREATE_RECORD', { objectName: 'unknown' })),
    ).toThrow('Object unknown not found');
  });
});
