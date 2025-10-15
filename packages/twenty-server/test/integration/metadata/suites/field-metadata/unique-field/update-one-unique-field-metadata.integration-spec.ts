import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { type UpdateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

type SuccessfulTestCases = EachTestingContext<
  (args: {
    createdObjectMetadataId: string;
    createdFieldId: string;
  }) => UpdateOneFieldFactoryInput
>[];

const successfulTestCases: SuccessfulTestCases = [
  {
    title: 'should update non unique field metadata to unique',
    context: ({ createdFieldId }) => ({
      idToUpdate: createdFieldId,
      updatePayload: { isUnique: true },
    }),
  },
  {
    title: 'should update unique field metadata to non unique',
    context: ({ createdFieldId }) => ({
      idToUpdate: createdFieldId,
      updatePayload: { isUnique: false },
    }),
  },
];

describe('successful updateOne unique field metadata', () => {
  let createdObjectId = '';
  let createdFieldId = '';

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testObjectForUpdateUniqueField',
        namePlural: 'testObjectsForUpdateUniqueField',
        labelSingular: 'Test Object For Update Unique Field',
        labelPlural: 'Test Objects For Update Unique Field',
        icon: 'IconTest',
      },
    });

    createdObjectId = objectMetadataId;

    const { data: createdField } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectId,
        isUnique: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    createdFieldId = createdField.createOneField.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectId },
    });
  });

  it.each(eachTestingContextFilter(successfulTestCases))(
    '$title',
    async ({ context }) => {
      const contextPayload = context({
        createdObjectMetadataId: createdObjectId,
        createdFieldId,
      });

      const { data, errors } = await updateOneFieldMetadata({
        input: contextPayload,
        expectToFail: false,
        gqlFields: `
          id
          name
          label
          type
          isUnique
        `,
      });

      expect(errors).toBeUndefined();
      expect(data).not.toBeNull();
      expect(data.updateOneField).toBeDefined();
      expect(data.updateOneField.isUnique).toBe(
        contextPayload.updatePayload.isUnique,
      );
    },
  );

  it('should update unique index name if field metadata name is updated', async () => {
    const { data: uniqueField } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'uniqueTestFieldForRename',
        label: 'Unique Test Field For Rename',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectId,
        isUnique: true,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: uniqueField.createOneField.id,
        updatePayload: {
          name: 'renamedUniqueField',
          label: 'Renamed Unique Field',
        },
      },
      expectToFail: false,
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    expect(data.updateOneField).toBeDefined();
    expect(data.updateOneField.name).toBe('renamedUniqueField');
    expect(data.updateOneField.isUnique).toBe(true);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: uniqueField.createOneField.id,
        updatePayload: {
          isActive: false,
        },
      },
      gqlFields: `
        id
      `,
    });

    const { data: deletedField, errors: deletedFieldErrors } =
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: {
          idToDelete: uniqueField.createOneField.id,
        },
      });

    expect(deletedField).not.toBeNull();
    expect(deletedFieldErrors).toBeUndefined();
  });

  it('should update a standard field to unique field metadata if it has not standard unique index', async () => {
    const { data: standardField } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testStandardField',
        label: 'Test Standard Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectId,
        isUnique: false,
        isCustom: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data: addUniqueData, errors: addUniqueErrors } =
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: standardField.createOneField.id,
          updatePayload: { isUnique: true },
        },
        gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
      });

    expect(addUniqueErrors).toBeUndefined();
    expect(addUniqueData).not.toBeNull();
    expect(addUniqueData.updateOneField).toBeDefined();
    expect(addUniqueData.updateOneField.isUnique).toBe(true);

    const { data: removeUniqueData, errors: removeUniqueErrors } =
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: standardField.createOneField.id,
          updatePayload: { isUnique: false },
        },
        gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
      });

    expect(removeUniqueErrors).toBeUndefined();
    expect(removeUniqueData).not.toBeNull();
    expect(removeUniqueData.updateOneField).toBeDefined();
    expect(removeUniqueData.updateOneField.isUnique).toBe(false);
  });
});

describe('failing updateOne unique field metadata', () => {
  let createdObjectId = '';

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testObjectForFailingUpdateUniqueField',
        namePlural: 'testObjectsForFailingUpdateUniqueField',
        labelSingular: 'Test Object For Failing Update Unique Field',
        labelPlural: 'Test Objects For Failing Update Unique Field',
        icon: 'IconTest',
      },
    });

    createdObjectId = objectMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectId },
    });
  });

  it('should fail when updating to unique field metadata if it has custom default value', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'fieldWithDefault',
        label: 'Field With Default',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectId,
        defaultValue: "'defaultValue'",
        isUnique: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { isUnique: true },
      },
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);
    const [firstError] = errors;

    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  });

  it('should fail when updating with custom default value if unique field metadata', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'uniqueTestFieldForDefaultValue',
        label: 'Unique Test Field For Default Value',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectId,
        isUnique: true,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { defaultValue: "'defaultValue'" },
      },
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);
    const [firstError] = errors;

    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  });

  it('should fail when updating to unique field metadata if it has composite type without unique subfields', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'fullNameFieldForUnique',
        label: 'Full Name Field For Unique',
        type: FieldMetadataType.FULL_NAME,
        objectMetadataId: createdObjectId,
        isUnique: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { isUnique: true },
      },
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);
    const [firstError] = errors;

    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  });
});
