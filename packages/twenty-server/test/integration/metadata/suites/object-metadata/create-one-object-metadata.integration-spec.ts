import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { EachTestingContext, isDefined } from 'twenty-shared';

type CreateObjectInputPayload = Omit<
  CreateObjectInput,
  'workspaceId' | 'dataSourceId'
>;
const FailingCreationTestsUseCase: EachTestingContext<
  Partial<CreateObjectInputPayload>
>[] = [
  {
    title: 'NameSingular is an empty string',
    context: {
      nameSingular: '',
    },
  },
];

const getMockCreateObjectInput = (
  overrides?: Partial<CreateObjectInputPayload>,
): CreateObjectInputPayload => ({
  namePlural: 'listings',
  nameSingular: 'toto',
  labelPlural: 'Listings',
  labelSingular: 'Listing',
  description: 'Listing object',
  icon: 'IconListNumbers',
  isLabelSyncedWithName: false,
  ...overrides,
});

describe('Object metadata failing creation', () => {
  const performFailingObjectMetadataCreation = async (
    args: CreateObjectInputPayload,
  ) => {
    const graphqlOperation = createOneObjectMetadataFactory({
      input: { object: args },
      gqlFields: `
          id
          nameSingular
      `,
    });

    const response = await makeMetadataAPIRequest(graphqlOperation);
    if (isDefined(response.body.data)) {
      const createdId = response.body.data.createOneObject.id;
      await deleteOneObjectMetadataItem(createdId);
      fail('Object Metadata Item should have failed but did not');
    }

    return response;
  };
  it.each(FailingCreationTestsUseCase)('$title', async ({ context }) => {
    const response = await performFailingObjectMetadataCreation(
      getMockCreateObjectInput(context),
    );

    expect(response.body.errors).toMatchSnapshot();
  });
});
