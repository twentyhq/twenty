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
    title: 'phones field basic metadata (label, description, icon)',
    context: {
      input: {
        label: 'Updated Phones',
        description: 'Updated description',
        icon: 'IconPhoneCall',
      },
    },
  },
  {
    title: 'phones field settings with maxNumberOfValues',
    context: {
      input: {
        settings: {
          maxNumberOfValues: 4,
        },
      },
    },
  },
  {
    title: 'phones field default value with primary phone',
    context: {
      input: {
        defaultValue: {
          primaryPhoneNumber: "'+33123456789'",
          primaryPhoneCountryCode: "'FR'",
          primaryPhoneCallingCode: "'+33'",
          additionalPhones: null,
        },
      },
    },
  },
  {
    title: 'phones field default value with empty values',
    context: {
      input: {
        defaultValue: {
          primaryPhoneNumber: "''",
          primaryPhoneCountryCode: "''",
          primaryPhoneCallingCode: "''",
          additionalPhones: null,
        },
      },
    },
  },
  {
    title: 'phones field default value set to null',
    context: {
      input: {
        defaultValue: null,
      },
    },
  },
  {
    title: 'phones field settings and default value together',
    context: {
      input: {
        settings: {
          maxNumberOfValues: 6,
        },
        defaultValue: {
          primaryPhoneNumber: "'+1555123456'",
          primaryPhoneCountryCode: "'US'",
          primaryPhoneCallingCode: "'+1'",
          additionalPhones: null,
        },
      },
    },
  },
];

describe('Phones field metadata update tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testPhonesUpdateObject',
        namePlural: 'testPhonesUpdateObjects',
        labelSingular: 'Test Phones Update Object',
        labelPlural: 'Test Phones Update Objects',
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
        type: FieldMetadataType.PHONES,
        name: 'testPhones',
        label: 'Test Phones',
        description: 'Initial description',
        icon: 'IconPhone',
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
