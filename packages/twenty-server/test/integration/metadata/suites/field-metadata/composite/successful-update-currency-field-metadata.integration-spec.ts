import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

const SUCCESSFUL_TEST_CASES: EachTestingContext<{
  input: Partial<UpdateFieldInput>;
}>[] = [
  {
    title: 'currency field basic metadata (label, description, icon)',
    context: {
      input: {
        label: 'Updated Currency',
        description: 'Updated description',
        icon: 'IconCoin',
      },
    },
  },
  {
    title: 'currency field default value with amount and currency',
    context: {
      input: {
        defaultValue: {
          amountMicros: "'1000000'",
          currencyCode: "'USD'",
        },
      },
    },
  },
  {
    title: 'currency field default value with zero amount',
    context: {
      input: {
        defaultValue: {
          amountMicros: "'0'",
          currencyCode: "'EUR'",
        },
      },
    },
  },
  {
    title: 'currency field default value with only currency code',
    context: {
      input: {
        defaultValue: {
          amountMicros: null,
          currencyCode: "'GBP'",
        },
      },
    },
  },
  {
    title: 'currency field default value with empty values',
    context: {
      input: {
        defaultValue: {
          amountMicros: null,
          currencyCode: "''",
        },
      },
    },
  },
  {
    title: 'currency field default value set to null',
    context: {
      input: {
        defaultValue: null,
      },
    },
  },
];

describe('Currency field metadata update tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testCurrencyUpdateObject',
        namePlural: 'testCurrencyUpdateObjects',
        labelSingular: 'Test Currency Update Object',
        labelPlural: 'Test Currency Update Objects',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  beforeEach(async () => {
    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.CURRENCY,
        name: 'testCurrency',
        label: 'Test Currency',
        description: 'Initial description',
        icon: 'IconCurrencyDollar',
        isLabelSyncedWithName: false,
      },
      gqlFields: `
        id
      `,
    });

    createdFieldMetadataId = createOneField.id;
  });

  afterEach(async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: createdFieldMetadataId },
    });
  });

  test.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'it should update $title',
    async ({ context: { input } }) => {
      const { data } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: createdFieldMetadataId,
          updatePayload: input,
        },
        gqlFields: `
          id
          type
          name
          label
          description
          icon
          settings
          defaultValue
        `,
      });

      expect(data.updateOneField).toMatchObject(input);
    },
  );
});
