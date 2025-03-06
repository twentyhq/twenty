import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { EachTestingContext } from 'twenty-shared';

type FailingCreationEachTestingContext = EachTestingContext<
  Partial<Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>>
>;
const FailingCreationTestsUseCase: FailingCreationEachTestingContext[] = [
  {
    title: 'NameSingular is an empty string',
    context: {
      nameSingular: '',
    },
  },
];

describe('Object metadata failing creation', () => {
  const createdObjectMetadataIds: string[] = [];
  const createOneObjectMetadata = async (
    args: Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>,
  ) => {
    const graphqlOperation = createOneObjectMetadataFactory({
      input: { object: args },
      gqlFields: `
          id
          nameSingular
      `,
    });

    const response = await makeMetadataAPIRequest(graphqlOperation);
    const createdObject = response.body.data.createOneObject;
    createdObjectMetadataIds.push(createdObject.id);
    return createdObject;
  };
  afterEach(async () => {
    await Promise.all(
      createdObjectMetadataIds.map(
        async (id) => await deleteOneObjectMetadataItem(id),
      ),
    );
  });
  it('1. should create one object metadataItem', async () => {
    // Arrange
    const LISTING_OBJECT: Omit<
      CreateObjectInput,
      'workspaceId' | 'dataSourceId'
    > = {
      namePlural: 'listings',
      nameSingular: 'toto',
      labelPlural: 'Listings',
      labelSingular: 'Listing',
      description: 'Listing object',
      icon: 'IconListNumbers',
      isLabelSyncedWithName: false,
    };

    // Act
    const createdObject = await createOneObjectMetadata(LISTING_OBJECT);

    // Assert
    expect(createdObject).toMatchInlineSnapshot(`
{
  "id": "25e904da-5c21-410a-8113-1b751df075c5",
  "nameSingular": "toto",
}
`);
  });
});
