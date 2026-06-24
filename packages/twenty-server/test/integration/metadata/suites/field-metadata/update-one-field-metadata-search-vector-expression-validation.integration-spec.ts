import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

describe('Field metadata update - search vector expression is validated', () => {
  let testObjectMetadataId: string;
  let labelIdentifierFieldMetadataId: string;
  let searchVectorFieldMetadataId: string;
  let originalAsExpression: string;

  const RUN_SUFFIX = `${Date.now()}`;
  const OBJECT_NAME_SINGULAR = `searchVectorObject${RUN_SUFFIX}`;
  const OBJECT_NAME_PLURAL = `searchVectorObjects${RUN_SUFFIX}`;
  const LABEL_FIELD_NAME = `searchVectorTitle${RUN_SUFFIX}`;

  const getSearchVectorField = async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: { id: { eq: testObjectMetadataId } },
        paging: { first: 1 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
          type
          settings
        }
      `,
    });

    const testObject = objects[0];

    jestExpectToBeDefined(testObject);
    jestExpectToBeDefined(testObject.fieldsList);

    const searchVectorField = testObject.fieldsList.find(
      (field: FieldMetadataDTO) => field.type === FieldMetadataType.TS_VECTOR,
    );

    jestExpectToBeDefined(searchVectorField);

    return searchVectorField as FieldMetadataDTO<FieldMetadataType.TS_VECTOR>;
  };

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: OBJECT_NAME_PLURAL,
        labelSingular: 'Search Vector Object',
        labelPlural: 'Search Vector Objects',
        icon: 'IconSearch',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: LABEL_FIELD_NAME,
        label: 'Search Vector Title',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id name label`,
    });

    labelIdentifierFieldMetadataId = fieldMetadataId;

    await updateOneObjectMetadata({
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          labelIdentifierFieldMetadataId,
        },
      },
      expectToFail: false,
    });

    const searchVectorField = await getSearchVectorField();

    searchVectorFieldMetadataId = searchVectorField.id;
    originalAsExpression = searchVectorField.settings?.asExpression ?? '';
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  it('rejects a malformed searchVector expression and leaves the stored expression unchanged', async () => {
    const invalidAsExpression = `to_tsvector('simple', coalesce("${LABEL_FIELD_NAME}", '')`;

    const { errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: searchVectorFieldMetadataId,
        updatePayload: {
          settings: {
            asExpression: invalidAsExpression,
            generatedType: 'STORED',
          },
        },
      },
      gqlFields: `id name settings`,
      expectToFail: true,
    });

    jestExpectToBeDefined(errors);

    const searchVectorFieldAfter = await getSearchVectorField();

    expect(searchVectorFieldAfter.settings?.asExpression).toBe(
      originalAsExpression,
    );
  });
});
