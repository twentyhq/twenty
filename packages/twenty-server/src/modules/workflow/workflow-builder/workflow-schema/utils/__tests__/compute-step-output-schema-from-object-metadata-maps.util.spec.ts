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
import { computeStepOutputSchemaFromObjectMetadataMaps } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-step-output-schema-from-object-metadata-maps.util';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const compute = (step: object) =>
  computeStepOutputSchemaFromObjectMetadataMaps({
    step: step as WorkflowTrigger | WorkflowAction,
    objectMetadataMaps: {
      flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
      flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
      objectIdByNameSingular: mockObjectIdByNameSingular,
    },
  });

const manualTrigger = (availability: object) => ({
  type: 'MANUAL',
  settings: { outputSchema: {}, availability },
});

const action = (type: string, input: unknown) => ({
  type,
  settings: { input, outputSchema: {} },
});

describe('computeStepOutputSchemaFromObjectMetadataMaps', () => {
  it('describes only the run metadata of a globally available manual trigger', () => {
    expect(compute(manualTrigger({ type: 'GLOBAL' }))).toEqual({
      [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
    });
  });

  it('describes the selected records of a bulk manual trigger', () => {
    expect(
      compute(
        manualTrigger({ type: 'BULK_RECORDS', objectNameSingular: 'company' }),
      ),
    ).toMatchObject({
      [WORKFLOW_TRIGGER_PAYLOAD_KEY]: {
        value: { companies: { type: 'array', label: 'Companies' } },
      },
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
      company: {
        isLeaf: false,
        label: 'Company',
        value: generateFakeObjectRecord({
          objectMetadataInfo: getMockObjectMetadataInfo('company'),
        }),
      },
    });
  });

  it('describes the previous record when waiting for an update', () => {
    expect(
      Object.keys(
        compute(action('WAIT_FOR_EVENT', { eventName: 'company.updated' })),
      ),
    ).toEqual(['record', 'recordId', 'before', 'updatedFields', 'hasTimedOut']);
    expect(
      compute(action('WAIT_FOR_EVENT', { eventName: 'not an event' })),
    ).toEqual({});
  });

  it('rejects a step on an object the workspace does not have', () => {
    expect(() =>
      compute(action('CREATE_RECORD', { objectName: 'unknown' })),
    ).toThrow('Object unknown not found');
  });
});
