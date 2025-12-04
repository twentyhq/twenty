import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { type UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

type TestingRuntimeContext = {
  objectMetadataId: string;
  numberFieldMetadataId: string;
  uuidFieldMetadataId: string;
};

type CreateOneObjectMetadataItemTestingContext = EachTestingContext<
  | ((args: TestingRuntimeContext) => Partial<UpdateObjectPayload>)
  | Partial<UpdateObjectPayload>
>[];

const labelIdentifierFailingTestsUseCase: CreateOneObjectMetadataItemTestingContext =
  [
    {
      title: 'when labelIdentifier is not a uuid',
      context: {
        labelIdentifierFieldMetadataId: 'not-a-uuid',
      },
    },
    {
      title: 'when labelIdentifier is not a known field metadata id',
      context: {
        labelIdentifierFieldMetadataId: '42422020-f49c-4159-8751-76a24f47b360',
      },
    },
    {
      title: 'when labelIdentifier is null',
      context: {
        labelIdentifierFieldMetadataId: null as any,
      },
    },
    {
      title: 'when labelIdentifier is not a TEXT or NAME field',
      context: ({ numberFieldMetadataId }) => ({
        labelIdentifierFieldMetadataId: numberFieldMetadataId,
      }),
    },
    {
      title:
        'when labelIdentifier is a UUID field (reserved for system objects)',
      context: ({ uuidFieldMetadataId }) => ({
        labelIdentifierFieldMetadataId: uuidFieldMetadataId,
      }),
    },
  ];

const allTestsUseCases = [...labelIdentifierFailingTestsUseCase];

describe('Object metadata update should fail', () => {
  let objectMetadataId: string;
  let numberFieldMetadataId: string;
  let uuidFieldMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        labelPlural: 'whatevers',
        labelSingular: 'whatever',
        namePlural: 'whatevers',
        nameSingular: 'whatever',
      },
    });

    objectMetadataId = data.createOneObject.id;

    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: objectMetadataId,
        name: 'testName',
        label: 'Test name',
        isLabelSyncedWithName: true,
        type: FieldMetadataType.NUMBER,
      },
    });

    numberFieldMetadataId = createOneField.id;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: { isCustom: { is: true } },
        paging: { first: 100 },
      },
      gqlFields: `
        id
        fieldsList {
          id
          type
        }
      `,
    });

    const createdObject = objects.find((obj) => obj.id === objectMetadataId);

    jestExpectToBeDefined(createdObject);

    const uuidField = createdObject.fieldsList?.find(
      (field) => field.type === FieldMetadataType.UUID,
    );

    jestExpectToBeDefined(uuidField);
    uuidFieldMetadataId = uuidField.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: {
        idToDelete: objectMetadataId,
      },
    });
  });

  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const updatePayload =
        typeof context === 'function'
          ? context({
              numberFieldMetadataId,
              objectMetadataId,
              uuidFieldMetadataId,
            })
          : context;

      const { errors } = await updateOneObjectMetadata({
        input: {
          idToUpdate: objectMetadataId,
          updatePayload,
        },
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    },
  );
});
