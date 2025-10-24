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

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

const SUCCESSFUL_TEST_CASES: EachTestingContext<{
  input: Omit<CreateFieldInput, 'objectMetadataId' | 'type' | 'workspaceId'>;
}>[] = [
  {
    title: 'address field with basic metadata (name, label, description, icon)',
    context: {
      input: {
        name: 'location',
        label: 'Location',
        description: 'Physical location',
        icon: 'IconMapPin',
      },
    },
  },
  {
    title: 'address field with subFields setting (street and city only)',
    context: {
      input: {
        name: 'simpleAddress',
        label: 'Simple Address',
        settings: {
          subFields: ['addressStreet1', 'addressCity'],
        },
      },
    },
  },
  {
    title: 'address field with all subFields',
    context: {
      input: {
        name: 'fullAddress',
        label: 'Full Address',
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
    title: 'address field with default value containing full address',
    context: {
      input: {
        name: 'officeAddress',
        label: 'Office Address',
        defaultValue: {
          addressStreet1: "'123 Main St'",
          addressStreet2: "'Suite 100'",
          addressCity: "'San Francisco'",
          addressState: "'CA'",
          addressPostcode: "'94102'",
          addressCountry: "'USA'",
          addressLat: null,
          addressLng: null,
        },
      },
    },
  },
  {
    title: 'address field with partial default value',
    context: {
      input: {
        name: 'shippingAddress',
        label: 'Shipping Address',
        defaultValue: {
          addressStreet1: "'456 Oak Ave'",
          addressStreet2: "''",
          addressCity: "'New York'",
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
    title: 'address field with empty default value',
    context: {
      input: {
        name: 'billingAddress',
        label: 'Billing Address',
        defaultValue: {
          addressStreet1: "''",
          addressStreet2: "''",
          addressCity: "''",
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
    title: 'address field with settings and default value',
    context: {
      input: {
        name: 'warehouseAddress',
        label: 'Warehouse Address',
        settings: {
          subFields: ['addressStreet1', 'addressCity', 'addressCountry'],
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

describe('Address field metadata creation tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string | undefined = undefined;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testAddressObject',
        namePlural: 'testAddressObjects',
        labelSingular: 'Test Address Object',
        labelPlural: 'Test Address Objects',
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

  afterEach(async () => {
    if (createdFieldMetadataId) {
      await updateOneFieldMetadata({
        input: {
          updatePayload: { isActive: false },
          idToUpdate: createdFieldMetadataId,
        },
        expectToFail: false,
      });
      await deleteOneFieldMetadata({
        input: { idToDelete: createdFieldMetadataId },
        expectToFail: false,
      });
      createdFieldMetadataId = undefined;
    }
  });

  test.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'it should create $title',
    async ({ context: { input } }) => {
      const inputPayload = {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.ADDRESS,
        isLabelSyncedWithName: false,
        ...input,
      };
      const { data } = await createOneFieldMetadata({
        expectToFail: false,
        input: inputPayload,
        gqlFields: `
          id
          type
          name
          label
          description
          icon
          defaultValue
          isLabelSyncedWithName
          settings
        `,
      });

      createdFieldMetadataId = data.createOneField.id;

      const { objectMetadataId: _, ...expectedFields } = inputPayload;

      expect(data.createOneField).toMatchObject(expectedFields);
    },
  );
});
