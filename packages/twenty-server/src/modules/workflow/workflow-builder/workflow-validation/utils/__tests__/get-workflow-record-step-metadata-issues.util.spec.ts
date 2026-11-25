import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { createMockCodeStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { type WorkflowCreateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const NOTE_OBJECT_ID = 'note-object';

const flatObjectMetadataMaps = addAllFlatEntitiesToFlatEntityMaps({
  flatEntities: [
    getFlatObjectMetadataMock({
      id: NOTE_OBJECT_ID,
      universalIdentifier: NOTE_OBJECT_ID,
      fieldIds: ['field-body'],
    }),
  ],
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatFieldMetadataMaps = addAllFlatEntitiesToFlatEntityMaps({
  flatEntities: [
    getFlatFieldMetadataMock({
      id: 'field-body',
      universalIdentifier: 'field-body',
      objectMetadataId: NOTE_OBJECT_ID,
      name: 'body',
      type: FieldMetadataType.RICH_TEXT,
    }),
  ],
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const objectIdByNameSingular = { note: NOTE_OBJECT_ID };

const buildCreateStep = (
  input: WorkflowCreateRecordActionInput,
): WorkflowAction => ({
  id: 'step-1',
  name: 'Create Record',
  type: WorkflowActionType.CREATE_RECORD,
  valid: true,
  settings: {
    input,
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: 0 },
    },
  },
});

const getIssues = (steps: WorkflowAction[]) =>
  getWorkflowRecordStepMetadataIssues({
    steps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular,
  });

describe('getWorkflowRecordStepMetadataIssues', () => {
  it('flags an unknown target object as OBJECT_NOT_FOUND', () => {
    const issues = getIssues([
      buildCreateStep({ objectName: 'ghost', objectRecord: {} }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'OBJECT_NOT_FOUND',
      stepId: 'step-1',
    });
  });

  it('flags a non-string object name as OBJECT_NOT_FOUND', () => {
    const issues = getIssues([
      buildCreateStep({
        // @ts-expect-error stored step inputs are unvalidated JSON
        objectName: 123,
        objectRecord: {},
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('OBJECT_NOT_FOUND');
  });

  it('flags a bare-string rich text value on a known object', () => {
    const issues = getIssues([
      buildCreateStep({
        objectName: 'note',
        objectRecord: { body: 'plain string' },
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('INVALID_RICH_TEXT_FIELD');
  });

  it('returns no issues for a valid record step', () => {
    const issues = getIssues([
      buildCreateStep({
        objectName: 'note',
        objectRecord: { body: { markdown: 'hi' } },
      }),
    ]);

    expect(issues).toEqual([]);
  });

  it('ignores steps that do not target a record object', () => {
    const issues = getIssues([createMockCodeStep('step-1')]);

    expect(issues).toEqual([]);
  });
});
