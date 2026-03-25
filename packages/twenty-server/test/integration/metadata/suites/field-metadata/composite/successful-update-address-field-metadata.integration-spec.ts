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
    title: 'address field basic metadata (label, description, icon)',
    context: {
      input: {
        label: 'Updated Address',
        description: 'Updated description',
        icon: 'IconHome',
      },
    },
  },
  {
    title: 'address field settings with limited subFields',
    context: {
      input: {
        settings: {
          subFields: ['addressStreet1', 'addressCity', 'addressCountry'],
        },
      },
    },
  },
  {
    title: 'address field settings with all subFields',
    context: {
      input: {
        settings: {
          subFields: [
            'addressStreet1',
            'addressStreet2',
            'addressCity',
            'addressState',
            'addressPostcode',
            'addressCountry',
            'addressLat',
            'addressLng',
          ],
        },
      },
    },
  },
  {
    title: 'address field default value with full address',
    context: {
      input: {
        defaultValue: {
          addressStreet1: "'123 Main St'",
          addressStreet2: "'Apt 4'",
          addressCity: "'New York'",
          addressState: "'NY'",
          addressPostcode: "'10001'",
          addressCountry: "'USA'",
          addressLat: null,
          addressLng: null,
        },
      },
    },
  },
  {
    title: 'address field default value with partial address',
    context: {
      input: {
        defaultValue: {
          addressStreet1: "'456 Oak Ave'",
          addressStreet2: "''",
          addressCity: "'Boston'",
          addressState: "''",
          addressPostcode: "''",
          addressCountry: "''",
          addressLat: null,
          addressLng: null,
        },
      },
    },
  },
  {
    title: 'address field default value set to null',
    context: {
      input: {
        defaultValue: null,
      },
    },
  },
  {
    title: 'address field settings and default value together',
    context: {
      input: {
        settings: {
          subFields: ['addressStreet1', 'addressCity', 'addressPostcode'],
        },
        defaultValue: {
          addressStreet1: "''",
          addressStreet2: "''",
          addressCity: "''",
          addressState: "''",
          addressPostcode: "''",
          addressCountry: "'USA'",
          addressLat: null,
          addressLng: null,
        },
      },
    },
  },
];

describe('Address field metadata update tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testAddressUpdateObject',
        namePlural: 'testAddressUpdateObjects',
        labelSingular: 'Test Address Update Object',
        labelPlural: 'Test Address Update Objects',
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
        type: FieldMetadataType.ADDRESS,
        name: 'testAddress',
        label: 'Test Address',
        description: 'Initial description',
        icon: 'IconMapPin',
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
