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
    title: 'links field with basic metadata (name, label, description, icon)',
    context: {
      input: {
        name: 'socialLinks',
        label: 'Social Links',
        description: 'Social media links',
        icon: 'IconLink',
      },
    },
  },
  {
    title: 'links field with maxNumberOfValues setting',
    context: {
      input: {
        name: 'limitedLinks',
        label: 'Limited Links',
        settings: {
          maxNumberOfValues: 5,
        },
      },
    },
  },
  {
    title: 'links field with default value containing primary link',
    context: {
      input: {
        name: 'websiteLinks',
        label: 'Website Links',
        defaultValue: {
          primaryLinkLabel: "'Website'",
          primaryLinkUrl: "'https://example.com'",
          secondaryLinks: null,
        },
      },
    },
  },
  {
    title: 'links field with empty default value',
    context: {
      input: {
        name: 'emptyLinks',
        label: 'Empty Links',
        defaultValue: {
          primaryLinkLabel: "''",
          primaryLinkUrl: "''",
          secondaryLinks: null,
        },
      },
    },
  },
  {
    title: 'links field with settings and default value',
    context: {
      input: {
        name: 'configuredLinks',
        label: 'Configured Links',
        settings: {
          maxNumberOfValues: 3,
        },
        defaultValue: {
          primaryLinkLabel: "'Homepage'",
          primaryLinkUrl: "'https://company.com'",
          secondaryLinks: null,
        },
      },
    },
  },
];

describe('Links field metadata creation tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string | undefined = undefined;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testLinksObject',
        namePlural: 'testLinksObjects',
        labelSingular: 'Test Links Object',
        labelPlural: 'Test Links Objects',
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
        type: FieldMetadataType.LINKS,
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
