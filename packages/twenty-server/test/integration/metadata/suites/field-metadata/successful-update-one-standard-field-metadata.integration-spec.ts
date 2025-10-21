import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
    eachTestingContextFilter,
    type EachTestingContext,
} from 'twenty-shared/testing';

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
  ];

describe('Standard field metadata update should succeed', () => {
  let companyNameFieldMetadataId: string;
  let originalFieldMetadata: any;

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
      `,
    });

    const companyObject = objects.find((o) => o.nameSingular === 'company');

    jestExpectToBeDefined(companyObject);

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        name
        label
        description
        icon
        isActive
        isCustom
        object {
          id
          nameSingular
        }
      `,
    });

    const companyNameField = fields
      .map((edge: any) => edge.node)
      .find(
        (field: any) =>
          field.object.id === companyObject.id &&
          field.name === 'name' &&
          !field.isCustom,
      );

    jestExpectToBeDefined(companyNameField);
    companyNameFieldMetadataId = companyNameField.id;
    originalFieldMetadata = companyNameField;
  });

  afterAll(async () => {
    // Restore original field metadata after all tests
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: companyNameFieldMetadataId,
        updatePayload: {
          label: originalFieldMetadata.label,
          description: originalFieldMetadata.description,
          icon: originalFieldMetadata.icon,
          isActive: originalFieldMetadata.isActive,
        },
      },
    });
  });

  it.each(eachTestingContextFilter(successfulUpdateTestsUseCase))(
    '$title',
    async ({ context }) => {
      const updatePayload = context;

      const { data, errors } = await updateOneFieldMetadata({
        input: {
          idToUpdate: companyNameFieldMetadataId,
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
        `,
      });

      expect(errors).toBeUndefined();
      expect(data.updateOneField).toBeDefined();
      expect(data.updateOneField.id).toBe(companyNameFieldMetadataId);

      expect(data.updateOneField).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.updateOneField }),
      );
    },
  );
});
