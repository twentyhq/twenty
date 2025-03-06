import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
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
    title: 'when nameSingular has invalid characters',
    context: { nameSingular: 'μ' },
  },
  {
    title: 'when namePlural has invalid characters',
    context: { namePlural: 'μ' },
  },
  {
    title: 'when nameSingular is a reserved keyword',
    context: { nameSingular: 'user' },
  },
  {
    title: 'when namePlural is a reserved keyword',
    context: { namePlural: 'users' },
  },
  {
    title: 'when nameSingular is not camelCased',
    context: { nameSingular: 'Not_Camel_Case' },
  },
  {
    title: 'when namePlural is not camelCased',
    context: { namePlural: 'Not_Camel_Case' },
  },
  {
    title: 'when namePlural is an empty string',
    context: { namePlural: '' },
  },
  {
    title: 'when nameSingular is an empty string',
    context: { nameSingular: '' },
  },
  {
    title: 'when name exceeds maximum length',
    context: { nameSingular: 'a'.repeat(64) },
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

describe('Object metadata creation should fail', () => {
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
      try {
        const createdId = response.body.data.createOneObject.id;
        await deleteOneObjectMetadataItem(createdId);
      } catch (e) {
        console.error(e);
      }
      fail('Object Metadata Item should have failed but did not');
    }
    expect(response.body.errors.length).toBe(1);
    return response.body.errors[0];
  };
  it.each(FailingCreationTestsUseCase)('$title', async ({ context }) => {
    const error = await performFailingObjectMetadataCreation(
      getMockCreateObjectInput(context),
    );

    expect(error.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
    expect(error.message).toMatchSnapshot();
  });
});
