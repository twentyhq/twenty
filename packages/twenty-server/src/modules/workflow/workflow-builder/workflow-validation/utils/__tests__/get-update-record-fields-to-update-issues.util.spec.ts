import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getUpdateRecordFieldsToUpdateIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-update-record-fields-to-update-issues.util';
import { type WorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const PERSON_OBJECT_METADATA_ID = 'person-object-metadata-id';

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

const getIssues = ({
  fieldsToUpdate,
  sourceFieldsToUpdate,
}: {
  fieldsToUpdate: string[];
  sourceFieldsToUpdate?: string[];
}) =>
  getUpdateRecordFieldsToUpdateIssues({
    step: {
      id: 'update-step',
      name: 'Update Person',
      settings: {
        input: {
          objectName: 'person',
          objectRecordId: '{{trigger.id}}',
          objectRecord: {},
          fieldsToUpdate,
        },
        outputSchema: {},
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: 0 },
        },
      },
    } satisfies Pick<WorkflowUpdateRecordAction, 'id' | 'name' | 'settings'>,
    objectMetadataInfo,
    sourceFieldsToUpdate,
  });

describe('getUpdateRecordFieldsToUpdateIssues', () => {
  it('accepts field names, relation names and join columns', () => {
    expect(
      getIssues({ fieldsToUpdate: ['jobTitle', 'company', 'companyId'] }),
    ).toEqual([]);
  });

  it('accepts a variable, resolved when the step runs', () => {
    expect(getIssues({ fieldsToUpdate: ['{{trigger.fieldName}}'] })).toEqual(
      [],
    );
  });

  it('blocks activation while names match no field of the object', () => {
    expect(
      getIssues({ fieldsToUpdate: ['jobTitle', 'employer', 'salary'] }),
    ).toEqual([
      expect.objectContaining({
        severity: 'error',
        code: 'FIELD_NOT_FOUND',
        stepId: 'update-step',
        message:
          'Step "Update Person" updates fields that "person" does not have: employer, salary. Remove them before activating.',
      }),
    ]);
  });

  it('refuses writing names the step did not already have', () => {
    expect(
      getIssues({
        fieldsToUpdate: ['employer', 'salary'],
        sourceFieldsToUpdate: ['employer'],
      }),
    ).toEqual([
      expect.objectContaining({ code: 'FIELD_NOT_FOUND' }),
      expect.objectContaining({
        code: 'INVALID_FIELD_TO_UPDATE',
        message:
          'Step "Update Person" updates unknown fields of "person": salary.',
      }),
    ]);
  });

  it('lets a write keep a name that became stale', () => {
    expect(
      getIssues({
        fieldsToUpdate: ['jobTitle', 'employer'],
        sourceFieldsToUpdate: ['employer'],
      }),
    ).toEqual([expect.objectContaining({ code: 'FIELD_NOT_FOUND' })]);
  });
});
