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
    title: 'rich text v2 field basic metadata (label, description, icon)',
    context: {
      input: {
        label: 'Updated Rich Text',
        description: 'Updated description',
        icon: 'IconFileText',
      },
    },
  },
  {
    title: 'rich text v2 field default value with markdown',
    context: {
      input: {
        defaultValue: {
          blocknote: null,
          markdown: "'# Default Title'",
        },
      },
    },
  },
  {
    title: 'rich text v2 field default value with blocknote',
    context: {
      input: {
        defaultValue: {
          blocknote: '\'{"blocks":[{"type":"paragraph"}]}\'',
          markdown: null,
        },
      },
    },
  },
  {
    title: 'rich text v2 field default value with both formats',
    context: {
      input: {
        defaultValue: {
          blocknote: '\'{"blocks":[]}\'',
          markdown: "'## Heading'",
        },
      },
    },
  },
  {
    title: 'rich text v2 field default value set to null',
    context: {
      input: {
        defaultValue: null,
      },
    },
  },
];

describe('Rich text v2 field metadata update tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testRichTextV2UpdateObject',
        namePlural: 'testRichTextV2UpdateObjects',
        labelSingular: 'Test Rich Text V2 Update Object',
        labelPlural: 'Test Rich Text V2 Update Objects',
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
        type: FieldMetadataType.RICH_TEXT_V2,
        name: 'testRichText',
        label: 'Test Rich Text',
        description: 'Initial description',
        icon: 'IconNotes',
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
