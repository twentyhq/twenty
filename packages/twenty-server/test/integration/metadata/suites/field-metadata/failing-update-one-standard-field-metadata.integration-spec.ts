import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import {
    eachTestingContextFilter,
    type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

type TestingRuntimeContext = {
  fieldMetadataId: string;
};

type UpdateOneStandardFieldMetadataTestingContext = EachTestingContext<
  | ((args: TestingRuntimeContext) => Partial<UpdateFieldInput>)
  | Partial<UpdateFieldInput>
>[];

const failingUpdateTestsUseCase: UpdateOneStandardFieldMetadataTestingContext =
  [
    {
      title: 'when trying to update name on standard field',
      context: {
        name: 'newName',
      },
    },
    {
      title: 'when trying to update isLabelSyncedWithName on standard field',
      context: {
        isLabelSyncedWithName: false,
      },
    },
    {
      title: 'when trying to update several forbidden properties',
      context: {
        name: 'newName',
        isLabelSyncedWithName: true,
      },
    },
  ];

const allTestsUseCases = [...failingUpdateTestsUseCase];

describe('Standard field metadata update should fail', () => {
  let companyNameFieldMetadataId: string;

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
  });

  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const updatePayload =
        typeof context === 'function'
          ? context({ fieldMetadataId: companyNameFieldMetadataId })
          : context;

      const { errors } = await updateOneFieldMetadata({
        input: {
          idToUpdate: companyNameFieldMetadataId,
          updatePayload,
        },
        expectToFail: true,
        gqlFields: `
          id
          name
          label
          description
          icon
          isActive
          isCustom`,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
