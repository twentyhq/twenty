import { type RollupTestObjects } from 'test/integration/metadata/suites/field-metadata/rollup/utils/setup-rollup-test-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

export const teardownRollupTestObjects = async ({
  projectObjectMetadataId,
  taskObjectMetadataId,
}: Pick<
  RollupTestObjects,
  'projectObjectMetadataId' | 'taskObjectMetadataId'
>) => {
  for (const objectMetadataId of [
    projectObjectMetadataId,
    taskObjectMetadataId,
  ]) {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  }
};
