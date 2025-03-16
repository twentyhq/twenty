import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { performObjectMetadataCreation } from 'test/integration/utils/object-metadata/perform-object-metadata-creation';
import { isDefined } from 'twenty-shared';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export const performFailingObjectMetadataCreation = async (
  objectInput: Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>,
) => {
  const response = await performObjectMetadataCreation(objectInput);

  if (isDefined(response.body.data)) {
    try {
      const createdId = response.body.data.createOneObject.id;

      await deleteOneObjectMetadataItem(createdId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    expect(false).toEqual(
      'Object Metadata Item should have failed but did not',
    );
  }
  expect(response.body.errors.length).toBeGreaterThan(0);

  return response.body.errors;
};
