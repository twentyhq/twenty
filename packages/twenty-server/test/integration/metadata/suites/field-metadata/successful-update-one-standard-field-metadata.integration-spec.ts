import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

type UpdateOneStandardFieldMetadataTestingContext = EachTestingContext<
  Partial<UpdateFieldInput>
>[];

const successfulUpdateTestsUseCase: UpdateOneStandardFieldMetadataTestingContext =
  [
    {
      title: 'when updating description',
      context: {
        description: 'Updated test description for company name field',
      },
    },
    {
      title: 'when updating icon',
      context: {
        icon: 'IconBuildingFactory',
      },
    },
    {
      title: 'when setting isActive to false',
      context: {
        isActive: false,
      },
    },
    {
      title: 'when updating label',
      context: {
        label: 'Business Name',
      },
    },
    {
      title: 'when updating options',
      context: {
        options: [
          { value: 'NEW', label: 'New Lead', position: 0, color: 'red' },
          {
            value: 'SCREENING',
            label: 'Under Review',
            position: 1,
            color: 'purple',
          },
          { value: 'MEETING', label: 'Meeting', position: 2, color: 'sky' },
          {
            value: 'PROPOSAL',
            label: 'Proposal Sent',
            position: 3,
            color: 'turquoise',
          },
          {
            value: 'CUSTOMER',
            label: 'Customer',
            position: 4,
            color: 'yellow',
          },
          { value: 'CLOSED', label: 'Closed', position: 5, color: 'green' },
        ],
      },
    },
    {
      title: 'when updating defaultValue',
      context: {
        defaultValue: "'SCREENING'",
      },
    },
  ];

describe('Standard field metadata update should succeed', () => {
  const opportunityObjectFields: FieldMetadataDTO[] = [];
  let originalFieldMetadataToRestore: FieldMetadataDTO[] = [];
  let originalStageFieldMetadata: FieldMetadataDTO | undefined;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
          label
          description
          icon
          isActive
          isCustom
          type
          options
          settings
          defaultValue
          standardOverrides {
            label
            description
            icon
          }
        }
      `,
    });

    const opportunityObject = objects.find(
      (o) => o.nameSingular === 'opportunity',
    );

    jestExpectToBeDefined(opportunityObject?.fieldsList);

    opportunityObjectFields.push(...opportunityObject.fieldsList);

    originalStageFieldMetadata = opportunityObjectFields.find(
      (field) => field.name === 'stage' && !field.isCustom,
    );
  });

  afterEach(async () => {
    for (const originalFieldMetadata of originalFieldMetadataToRestore) {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: originalFieldMetadata.id,
          updatePayload: {
            label: originalFieldMetadata.label,
            description: originalFieldMetadata.description,
            icon: originalFieldMetadata.icon,
            isActive: originalFieldMetadata.isActive,
            options: originalFieldMetadata.options,
            defaultValue: originalFieldMetadata.defaultValue,
          },
        },
      });
    }

    originalFieldMetadataToRestore = [];
  });

  describe('Atomic update test suite', () => {
    it.each(eachTestingContextFilter(successfulUpdateTestsUseCase))(
      '$title',
      async ({ context }) => {
        jestExpectToBeDefined(originalStageFieldMetadata);
        originalFieldMetadataToRestore.push(originalStageFieldMetadata);
        const updatePayload = context;
        const { data } = await updateOneFieldMetadata({
          input: {
            idToUpdate: (originalStageFieldMetadata as FieldMetadataDTO).id,
            updatePayload,
          },
          expectToFail: false,
          gqlFields: `
          id
          name
          label
          description
          icon
          isActive
          isCustom
          options
          defaultValue
          standardOverrides {
            label
            description
            icon
          }
        `,
        });

        expect(data.updateOneField.id).toBe(originalStageFieldMetadata.id);
        expect(data.updateOneField).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({ ...data.updateOneField }),
        );
      },
    );
  });

  it('Should deactivate and reactivate standard field successfully', async () => {
    const deletedAtField = opportunityObjectFields.find(
      (field) => field.name === 'deletedAt',
    );

    jestExpectToBeDefined(deletedAtField);
    expect(deletedAtField.isActive).toBe(true);

    const { data: firstUpdateData } = await updateOneFieldMetadata({
      input: {
        idToUpdate: deletedAtField.id,
        updatePayload: {
          isActive: false,
        },
      },
      expectToFail: false,
      gqlFields: `
          id
          name
          label
          description
          icon
          isActive
          isCustom
          options
          defaultValue
          standardOverrides {
            label
            description
            icon
          }
        `,
    });

    expect(firstUpdateData.updateOneField.isActive).toBe(false);

    const { data: secondUpdateData } = await updateOneFieldMetadata({
      input: {
        idToUpdate: deletedAtField.id,
        updatePayload: {
          isActive: true,
        },
      },
      expectToFail: false,
      gqlFields: `
          id
          name
          label
          description
          icon
          isActive
          isCustom
          options
          defaultValue
          standardOverrides {
            label
            description
            icon
          }
        `,
    });

    expect(secondUpdateData.updateOneField.isActive).toBe(true);
  });
});

describe('Standard field isUnique update should succeed', () => {
  let nameFieldMetadata: FieldMetadataDTO | undefined;
  let customObjectId: string;

  beforeEach(async () => {
    const customObject = {
      labelSingular: `Test Unique Standard Field`,
      labelPlural: `Test Unique Standard Fields`,
      namePlural: `testUniqueStandardField`,
      nameSingular: `testUniqueStandardFields`,
      description: 'Test unique standard field for isUnique update',
      icon: 'IconBox',
      isLabelSyncedWithName: false,
    };

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: customObject,
      gqlFields: `
        id
        nameSingular
      `,
    });

    customObjectId = data.createOneObject.id;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
          label
          isUnique
          isActive
          isCustom
          type
        }
      `,
    });

    const customObjectWithFields = objects.find((o) => o.id === customObjectId);

    jestExpectToBeDefined(customObjectWithFields?.fieldsList);

    nameFieldMetadata = customObjectWithFields.fieldsList?.find(
      (field) => field.name === 'name',
    );
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: customObjectId,
        updatePayload: {
          isActive: false,
        },
      },
    });

    await deleteOneObjectMetadata({
      input: {
        idToDelete: customObjectId,
      },
    });
  });

  // TODO: Enable this test once isUnique set as editable on standard fields
  it.failing('should set isUnique to true on standard field', async () => {
    jestExpectToBeDefined(nameFieldMetadata);

    const { data } = await updateOneFieldMetadata({
      input: {
        idToUpdate: nameFieldMetadata.id,
        updatePayload: {
          isUnique: true,
        },
      },
      expectToFail: false,
      gqlFields: `
        id
        name
        label
        isUnique
        isActive
        isCustom
      `,
    });

    expect(data.updateOneField.id).toBe(nameFieldMetadata.id);
    expect(data.updateOneField.name).toBe('name');
    expect(data.updateOneField.isUnique).toBe(true);

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const customObject = objects.find((obj) => obj.id === customObjectId);

    jestExpectToBeDefined(customObject);

    const nameFieldIndex = customObject.indexMetadataList.find((index) =>
      index.indexFieldMetadataList.some(
        (indexField) =>
          isDefined(nameFieldMetadata) &&
          indexField.fieldMetadataId === nameFieldMetadata.id,
      ),
    );

    jestExpectToBeDefined(nameFieldIndex);
    expect(nameFieldIndex.isUnique).toBe(true);
    expect(nameFieldIndex.isCustom).toBe(true);
  });
});
