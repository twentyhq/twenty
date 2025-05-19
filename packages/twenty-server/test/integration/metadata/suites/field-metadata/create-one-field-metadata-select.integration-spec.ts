import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

describe('Field metadata select creation tests group', () => {
  let createdObjectMetadataId: string;
  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });
  it('should create option with provided id', async () => {
    const { data: listingObjectMetadata } = await createOneObjectMetadata({
      input: {
        labelSingular: LISTING_NAME_SINGULAR,
        labelPlural: LISTING_NAME_PLURAL,
        nameSingular: LISTING_NAME_SINGULAR,
        namePlural: LISTING_NAME_PLURAL,
        icon: 'IconBuildingSkyscraper',
        isLabelSyncedWithName: true,
      },
    });

    createdObjectMetadataId = listingObjectMetadata.createOneObject.id;

    const fieldMetadataId = '224ea360-4358-485f-83c9-13a7c9bc917e';
    const options = [
      {
        label: 'Option 1',
        value: 'option1',
        color: 'green',
        position: 1,
        id: fieldMetadataId,
      },
    ];
    const { data: createdFieldMetadata, errors: errorsTmp } =
      await createOneFieldMetadata({
        input: {
          objectMetadataId: listingObjectMetadata.createOneObject.id,
          type: FieldMetadataType.SELECT,
          name: 'testName',
          label: 'Test name',
          isLabelSyncedWithName: true,
          options: [
            {
              label: 'Option 1',
              value: 'option1',
              color: 'green',
              position: 1,
              id: fieldMetadataId,
            },
          ],
        },
      });

    expect(createdFieldMetadata.createOneField.id).toBe(fieldMetadataId);

    const { fields, errors } = await findManyFieldsMetadata({
      gqlFields: `
        id
        options
        `,
      input: {
        paging: {
          first: 10,
        },
        filter: {
          id: { eq: createdFieldMetadata.createOneField.id },
        },
      },
    });

    expect(fields.length).toBe(1);
    expect(errors).toBeUndefined();
    expect(fields).toMatchObject({
      id: fieldMetadataId,
      options,
    });
  });
  // });
});
