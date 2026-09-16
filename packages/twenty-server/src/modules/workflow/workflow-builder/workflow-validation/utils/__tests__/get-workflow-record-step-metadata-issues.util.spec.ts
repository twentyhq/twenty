import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const NOTE_OBJECT_ID = 'note-object';

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    [NOTE_OBJECT_ID]: { id: NOTE_OBJECT_ID, fieldIds: ['field-body'] },
  },
  universalIdentifierById: { [NOTE_OBJECT_ID]: NOTE_OBJECT_ID },
} as unknown as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'field-body': {
      id: 'field-body',
      name: 'body',
      type: FieldMetadataType.RICH_TEXT,
    },
  },
  universalIdentifierById: { 'field-body': 'field-body' },
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

const objectIdByNameSingular = { note: NOTE_OBJECT_ID };

const buildCreateStep = (input: unknown): WorkflowAction =>
  ({
    id: 'step-1',
    name: 'Create Record',
    type: WorkflowActionType.CREATE_RECORD,
    settings: { input },
  }) as unknown as WorkflowAction;

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
      buildCreateStep({ objectName: 123, objectRecord: {} }),
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
    const issues = getIssues([
      {
        id: 'step-1',
        name: 'Send email',
        type: WorkflowActionType.SEND_EMAIL,
        settings: { input: {} },
      } as unknown as WorkflowAction,
    ]);

    expect(issues).toEqual([]);
  });
});
