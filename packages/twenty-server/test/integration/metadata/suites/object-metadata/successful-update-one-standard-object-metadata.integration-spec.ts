import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { type UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

type TestingRuntimeContext = {
  objectMetadataId: string;
};

type UpdateOneStandardObjectMetadataTestingContext = EachTestingContext<
  | ((args: TestingRuntimeContext) => Partial<UpdateObjectPayload>)
  | Partial<UpdateObjectPayload>
>[];

const successfulUpdateTestsUseCase: UpdateOneStandardObjectMetadataTestingContext =
  [
    {
      title: 'when updating description',
      context: {
        description: 'Updated test description for company',
      },
    },
    {
      title: 'when updating icon',
      context: {
        icon: 'IconBuildingSkyscraper',
      },
    },
    {
      title: 'when setting isActive to false',
      context: {
        isActive: false,
      },
    },
    {
      title: 'when updating labelSingular and labelPlural',
      context: {
        labelSingular: 'Business',
        labelPlural: 'Businesses',
      },
    },
  ];

const allTestsUseCases = [...successfulUpdateTestsUseCase];

describe('Standard object metadata update should succeed', () => {
  let companyObjectMetadataId: string;
  let originalCompanyMetadata: ObjectMetadataDTO;

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
        namePlural
        labelSingular
        labelPlural
        description
        icon
        isActive
        shortcut
      `,
    });

    const companyObject = objects.find((o) => o.nameSingular === 'company');

    jestExpectToBeDefined(companyObject);
    companyObjectMetadataId = companyObject.id;
    originalCompanyMetadata = companyObject;
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: companyObjectMetadataId,
        updatePayload: {
          labelSingular: originalCompanyMetadata.labelSingular,
          labelPlural: originalCompanyMetadata.labelPlural,
          description: originalCompanyMetadata.description,
          icon: originalCompanyMetadata.icon,
          isActive: originalCompanyMetadata.isActive,
          shortcut: originalCompanyMetadata.shortcut,
        },
      },
    });
  });

  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const updatePayload =
        typeof context === 'function'
          ? context({ objectMetadataId: companyObjectMetadataId })
          : context;

      const {
        data: { updateOneObject },
        errors,
      } = await updateOneObjectMetadata({
        input: {
          idToUpdate: companyObjectMetadataId,
          updatePayload,
        },
        expectToFail: false,
        gqlFields: `
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
          description
          icon
          isActive
          shortcut
          standardOverrides {
            labelSingular
            labelPlural
            description
            icon
          }
        `,
      });

      expect(errors).toBeUndefined();
      expect(updateOneObject).toBeDefined();
      expect(updateOneObject.id).toBe(companyObjectMetadataId);

      expect(updateOneObject).toMatchObject({
        ...updatePayload,
      });

      expect(updateOneObject).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...updateOneObject }),
      );
    },
  );
});
