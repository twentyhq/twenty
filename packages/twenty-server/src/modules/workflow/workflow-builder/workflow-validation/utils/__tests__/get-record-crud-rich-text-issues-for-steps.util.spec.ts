import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getRecordCrudRichTextIssuesForSteps } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues-for-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const OBJECT_ID = 'object-1';

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    [OBJECT_ID]: { id: OBJECT_ID, fieldIds: ['field-1', 'field-2'] },
  },
  universalIdentifierById: { [OBJECT_ID]: OBJECT_ID },
} as unknown as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'field-1': {
      id: 'field-1',
      name: 'body',
      type: FieldMetadataType.RICH_TEXT,
    },
    'field-2': { id: 'field-2', name: 'title', type: FieldMetadataType.TEXT },
  },
  universalIdentifierById: { 'field-1': 'field-1', 'field-2': 'field-2' },
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

const objectIdByNameSingular = { task: OBJECT_ID };

const buildStep = (type: WorkflowActionType, input: unknown): WorkflowAction =>
  ({
    id: 'step-1',
    name: 'Step 1',
    type,
    settings: { input },
  }) as unknown as WorkflowAction;

const getIssues = (steps: WorkflowAction[]) =>
  getRecordCrudRichTextIssuesForSteps({
    steps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular,
  });

describe('getRecordCrudRichTextIssuesForSteps', () => {
  it('flags a bare-string rich text value on a create-record step', () => {
    const issues = getIssues([
      buildStep(WorkflowActionType.CREATE_RECORD, {
        objectName: 'task',
        objectRecord: { body: 'plain string' },
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'INVALID_RICH_TEXT_FIELD',
      stepId: 'step-1',
    });
  });

  it('accepts a valid rich text object', () => {
    const issues = getIssues([
      buildStep(WorkflowActionType.UPDATE_RECORD, {
        objectName: 'task',
        objectRecord: { body: { markdown: 'text' } },
      }),
    ]);

    expect(issues).toEqual([]);
  });

  it('ignores steps that do not target a record object record', () => {
    expect(
      getIssues([
        buildStep(WorkflowActionType.SEND_EMAIL, {
          objectName: 'task',
          objectRecord: { body: 'plain string' },
        }),
      ]),
    ).toEqual([]);
  });

  it('skips steps with missing or malformed settings', () => {
    expect(
      getIssues([buildStep(WorkflowActionType.CREATE_RECORD, undefined)]),
    ).toEqual([]);
    expect(
      getIssues([
        buildStep(WorkflowActionType.CREATE_RECORD, { objectName: 'task' }),
      ]),
    ).toEqual([]);
  });

  it('skips steps targeting an unknown object', () => {
    expect(
      getIssues([
        buildStep(WorkflowActionType.CREATE_RECORD, {
          objectName: 'unknown',
          objectRecord: { body: 'plain string' },
        }),
      ]),
    ).toEqual([]);
  });
});
