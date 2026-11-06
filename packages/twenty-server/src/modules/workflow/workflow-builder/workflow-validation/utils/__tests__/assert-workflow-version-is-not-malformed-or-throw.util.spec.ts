import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { assertWorkflowVersionIsNotMalformedOrThrow } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/assert-workflow-version-is-not-malformed-or-throw.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const PERSON_OBJECT_ID = 'person-object';
const STEP_WITH_DELETED_FIELD_ID = '6c0f2a3e-1b4d-4c8e-9f10-000000000001';
const OTHER_STEP_ID = '6c0f2a3e-1b4d-4c8e-9f10-000000000002';

const buildUpdatePersonStep = ({
  id,
  fieldsToUpdate,
}: {
  id: string;
  fieldsToUpdate: string[];
}): WorkflowAction => ({
  id,
  name: 'Update Person',
  type: WorkflowActionType.UPDATE_RECORD,
  valid: true,
  settings: {
    input: {
      objectName: 'person',
      objectRecordId: '20202020-0000-4000-8000-000000000001',
      objectRecord: { jobTitle: 'CTO' },
      fieldsToUpdate,
    },
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: 0 },
    },
  },
});

const assertWrite = ({
  steps,
  sourceSteps,
}: {
  steps: WorkflowAction[];
  sourceSteps: WorkflowAction[];
}) =>
  assertWorkflowVersionIsNotMalformedOrThrow({
    trigger: null,
    steps,
    sourceSteps,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        getFlatObjectMetadataMock({
          id: PERSON_OBJECT_ID,
          universalIdentifier: PERSON_OBJECT_ID,
          nameSingular: 'person',
          namePlural: 'people',
          fieldIds: ['field-job-title'],
        }),
      ],
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        getFlatFieldMetadataMock({
          id: 'field-job-title',
          universalIdentifier: 'field-job-title',
          objectMetadataId: PERSON_OBJECT_ID,
          name: 'jobTitle',
          type: FieldMetadataType.TEXT,
        }),
      ],
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    objectIdByNameSingular: { person: PERSON_OBJECT_ID },
  });

describe('assertWorkflowVersionIsNotMalformedOrThrow', () => {
  // A draft copied from a version whose field was since deleted
  const sourceSteps = [
    buildUpdatePersonStep({
      id: STEP_WITH_DELETED_FIELD_ID,
      fieldsToUpdate: ['jobTitle', 'deletedField'],
    }),
    buildUpdatePersonStep({ id: OTHER_STEP_ID, fieldsToUpdate: ['jobTitle'] }),
  ];

  it('saves edits while a step keeps listing a deleted field', () => {
    expect(() =>
      assertWrite({
        steps: [
          sourceSteps[0],
          buildUpdatePersonStep({
            id: OTHER_STEP_ID,
            fieldsToUpdate: ['jobTitle'],
          }),
        ],
        sourceSteps,
      }),
    ).not.toThrow();
  });

  it('refuses a name the source content did not list', () => {
    expect(() =>
      assertWrite({
        steps: [
          buildUpdatePersonStep({
            id: STEP_WITH_DELETED_FIELD_ID,
            fieldsToUpdate: ['jobTitle', 'deletedField', 'employer'],
          }),
        ],
        sourceSteps,
      }),
    ).toThrow('updates unknown fields of "person": employer');
  });
});
