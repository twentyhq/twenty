import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

export const destroyManyObjectsMetadata = async (
  objectMetadataIds: string[],
) => {
  for (const objectMetadataId of objectMetadataIds) {
    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: {
        idToDelete: objectMetadataId,
      },
    });
  }
};
