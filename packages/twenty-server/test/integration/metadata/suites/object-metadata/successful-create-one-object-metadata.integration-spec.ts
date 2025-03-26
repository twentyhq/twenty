import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { performObjectMetadataCreation } from 'test/integration/metadata/suites/object-metadata/utils/perform-object-metadata-creation';
import { getMockCreateObjectInput } from 'test/integration/utils/object-metadata/generate-mock-create-object-metadata-input';
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
    const response = await performObjectMetadataCreation(
      getMockCreateObjectInput(context),
    );

    expect(response.body.data.createOneObject.id).toBeDefined();
    await deleteOneObjectMetadataItem(
      response.body.data.createOneObject.id,
    ).catch();
  });
});
