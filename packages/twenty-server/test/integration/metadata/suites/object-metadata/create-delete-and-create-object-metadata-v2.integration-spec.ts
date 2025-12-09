import { type CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

describe('Handle same object sequential operations test suite', () => {
  let createdObjectMetadataId: string | undefined = undefined;
  const uniqueSuffix = Date.now().toString().slice(-8);

  afterEach(async () => {
    if (!isDefined(createdObjectMetadataId)) {
      return;
    }
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
      expectToFail: false,
    });

    createdObjectMetadataId = undefined;
  });
  it('It should handle creation deletion and creation of the same metadata entity gracefully', async () => {
    const createObjectInput: CreateOneObjectFactoryInput = {
      namePlural: `dishes${uniqueSuffix}`,
      nameSingular: `dish${uniqueSuffix}`,
      labelPlural: `Dishes ${uniqueSuffix}`,
      labelSingular: `Dish ${uniqueSuffix}`,
      description: 'My favorite dishes',
      icon: 'IconBuildingSkyscraper',
      isLabelSyncedWithName: false,
    };
    const objectCreationGqlFields = `
    id
    labelPlural
    description
    labelSingular
    namePlural
    nameSingular
    icon
    isLabelSyncedWithName
`;
    const fieldCreationGqlFields = `
    id
    label
    name
    type
    description
`;
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: objectCreationGqlFields,
    });

    createdObjectMetadataId = createOneObject.id;
    expect(createOneObject).toMatchObject(createObjectInput);

    const createFieldInput: Omit<
      CreateOneFieldFactoryInput,
      'objectMetadataId'
    > = {
      label: 'field label',
      name: 'fieldName',
      type: FieldMetadataType.TEXT,
      description: 'custom description',
    };
    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      input: {
        ...createFieldInput,
        objectMetadataId: createdObjectMetadataId,
      },
      expectToFail: false,
      gqlFields: fieldCreationGqlFields,
    });

    expect(createOneField).toMatchObject(createFieldInput);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createOneField.id,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneFieldMetadata({
      input: {
        idToDelete: createOneField.id,
      },
      expectToFail: false,
    });

    const {
      data: { createOneField: secondCreateOneField },
    } = await createOneFieldMetadata({
      input: {
        ...createFieldInput,
        objectMetadataId: createdObjectMetadataId,
      },
      expectToFail: false,
      gqlFields: fieldCreationGqlFields,
    });

    expect(secondCreateOneField).toMatchObject(createFieldInput);

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
      expectToFail: false,
    });
    createdObjectMetadataId = undefined;

    const {
      data: { createOneObject: secondCreateOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: objectCreationGqlFields,
    });

    createdObjectMetadataId = secondCreateOneObject.id;
    expect(secondCreateOneObject).toMatchObject(createObjectInput);

    const {
      data: { createOneField: thirdCreateOneField },
    } = await createOneFieldMetadata({
      input: {
        ...createFieldInput,
        objectMetadataId: createdObjectMetadataId,
      },
      expectToFail: false,
      gqlFields: fieldCreationGqlFields,
    });

    expect(thirdCreateOneField).toMatchObject(createFieldInput);
  });
});
