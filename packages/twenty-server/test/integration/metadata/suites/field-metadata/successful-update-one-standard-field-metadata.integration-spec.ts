import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
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
        fieldsList {
          id
          name
          label
          description
          icon
          isActive
          isCustom
        }
      `,
    });

    const companyObject = objects.find((o) => o.nameSingular === 'company');

    jestExpectToBeDefined(companyObject);

    const companyNameField = companyObject.fieldsList?.find(
      (field: any) => field.name === 'name' && !field.isCustom,
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

      console.log(data.updateOneField);
      expect(data.updateOneField).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.updateOneField }),
      );
    },
  );
});

describe('Standard field metadata update with standard overrides', () => {
  let opportunityStageFieldMetadataId: string;
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
      (field: any) => field.name === 'stage' && !field.isCustom,
    );

    jestExpectToBeDefined(opportunityStageField);
    opportunityStageFieldMetadataId = opportunityStageField.id;
    originalStageFieldMetadata = opportunityStageField;
  });

  afterEach(async () => {
    // Restore original field metadata after all tests
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: opportunityStageFieldMetadataId,
        updatePayload: {
          options: originalStageFieldMetadata.options,
          defaultValue: originalStageFieldMetadata.defaultValue,
          settings: originalStageFieldMetadata.settings,
        },
      },
    });
  });

  it('should successfully update options on standard SELECT field', async () => {
    const newOptions = [
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
      { value: 'CUSTOMER', label: 'Customer', position: 4, color: 'yellow' },
      { value: 'CLOSED', label: 'Closed', position: 5, color: 'green' },
    ];

    const { data } = await updateOneFieldMetadata({
      input: {
        idToUpdate: opportunityStageFieldMetadataId,
        updatePayload: {
          options: newOptions,
        },
      },
      expectToFail: false,
      gqlFields: `
        id
        name
        type
        options
        standardOverrides {
          label
          description
          icon
        }
      `,
    });

    jestExpectToBeDefined(data.updateOneField.options);
    expect(data.updateOneField.options).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(data.updateOneField.options as any), // TODO improve
    );
  });

  it('should successfully update defaultValue on standard SELECT field', async () => {
    const newDefaultValue = "'SCREENING'";
    expect(originalStageFieldMetadata.defaultValue).not.toBe(newDefaultValue);
    const { data } = await updateOneFieldMetadata({
      input: {
        idToUpdate: opportunityStageFieldMetadataId,
        updatePayload: {
          defaultValue: newDefaultValue,
        },
      },
      expectToFail: false,
      gqlFields: `
        id
        name
        type
        defaultValue
        standardOverrides {
          label
          description
          icon
        }
      `,
    });

    expect(data.updateOneField.defaultValue).toBe(newDefaultValue);
  });

  it('should preserve standardOverrides when updating other properties', async () => {
    await updateOneFieldMetadata({
      input: {
        idToUpdate: opportunityStageFieldMetadataId,
        updatePayload: {
          label: 'Deal Stage',
        },
      },
      expectToFail: false,
    });

    const { data } = await updateOneFieldMetadata({
      input: {
        idToUpdate: opportunityStageFieldMetadataId,
        updatePayload: {
          defaultValue: "'NEW'",
        },
      },
      expectToFail: false,
      gqlFields: `
        id
        name
        label
        defaultValue
        standardOverrides {
          label
          description
          icon
        }
      `,
    });

    expect(data.updateOneField.standardOverrides).toEqual(
      originalStageFieldMetadata.standardOverrides,
    );
    expect(data.updateOneField.defaultValue).toBe("'NEW'");
  });
});
