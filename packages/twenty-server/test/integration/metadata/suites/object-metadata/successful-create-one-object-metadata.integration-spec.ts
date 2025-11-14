import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { type EachTestingContext } from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

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
      title: 'with basic input',
      context: {},
    },
  ];

const allTestsUseCases = [...successfulObjectMetadataItemCreateOneUseCase];

describe('Object metadata creation should succeed', () => {
  let createdObjectId: string | undefined;

  afterEach(async () => {
    if (!isDefined(createdObjectId)) {
      return;
    }
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectId },
    });
  });

  it.each(allTestsUseCases)('$title', async ({ context }) => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: getMockCreateObjectInput(context),
    });

    expect(data.createOneObject.id).toBeDefined();
    createdObjectId = data.createOneObject.id;
  });
});
