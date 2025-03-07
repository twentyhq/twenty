import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { getMockCreateObjectInput } from 'test/integration/utils/object-metadata/generate-mock-create-object-metadata-input';
import { performFailingObjectMetadataCreation } from 'test/integration/utils/object-metadata/perform-failing-object-metadata-creation';
import { EachTestingContext } from 'twenty-shared';

type CreateObjectInputPayload = Omit<
  CreateObjectInput,
  'workspaceId' | 'dataSourceId'
>;
type CreateOneObjectMetadataItemTestingContext = EachTestingContext<
  Partial<CreateObjectInputPayload>
>[];
const successfulObjectMetadataItemCreateOneUseCase: CreateOneObjectMetadataItemTestingContext =
  [
    {
      title: 'when nameSingular has invalid characters',
      context: { nameSingular: 'μ' },
    },
  ];

const allTestsUseCases = [...successfulObjectMetadataItemCreateOneUseCase];

describe('Object metadata creation should fail', () => {
  it.each(allTestsUseCases)('$title', async ({ context }) => {
    const errors = await performFailingObjectMetadataCreation(
      getMockCreateObjectInput(context),
    );
    expect(errors.length).toBe(1);
    const firstError = errors[0];
    expect(firstError.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
    expect(firstError.message).toMatchSnapshot();
  });
});
