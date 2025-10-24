import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

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
  let originalStageFieldMetadata: FieldMetadataDTO;

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

    jestExpectToBeDefined(opportunityObject);

    const opportunityStageField = opportunityObject.fieldsList?.find(
      (field) => field.name === 'stage' && !field.isCustom,
    );

    jestExpectToBeDefined(opportunityStageField);
    originalStageFieldMetadata = opportunityStageField;
  });

  afterEach(async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: originalStageFieldMetadata.id,
        updatePayload: {
          label: originalStageFieldMetadata.label,
          description: originalStageFieldMetadata.description,
          icon: originalStageFieldMetadata.icon,
          isActive: originalStageFieldMetadata.isActive,
          options: originalStageFieldMetadata.options,
          defaultValue: originalStageFieldMetadata.defaultValue,
        },
      },
    });
  });

  it.each(eachTestingContextFilter(successfulUpdateTestsUseCase))(
    '$title',
    async ({ context }) => {
      const updatePayload = context;

      const { data } = await updateOneFieldMetadata({
        input: {
          idToUpdate: originalStageFieldMetadata.id,
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
