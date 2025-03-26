import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { EachTestingContext } from 'twenty-shared/testing';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

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
    // TODO populate
  ];

const allTestsUseCases = [...successfulObjectMetadataItemCreateOneUseCase];

describe('Object metadata creation should succeed', () => {
  it.each(allTestsUseCases)('$title', async ({ context }) => {
    const { data } = await createOneObjectMetadata({
      input: getMockCreateObjectInput(context),
    });

    expect(data.createOneObject.id).toBeDefined();
    await deleteOneObjectMetadata({
      input: { idToDelete: data.createOneObject.id },
    }).catch();
  });
});
