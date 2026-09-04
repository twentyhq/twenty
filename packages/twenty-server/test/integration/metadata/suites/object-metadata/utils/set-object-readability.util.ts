import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type MetadataReadability } from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const setObjectReadability = async (
  objectMetadataId: string,
  readability: MetadataReadability,
) => {
  await getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).update(
    objectMetadataId,
    { readability },
  );

  const { errors } = await updateOneObjectMetadata({
    expectToFail: false,
    input: {
      idToUpdate: objectMetadataId,
      updatePayload: { description: `readability set to ${readability}` },
    },
  });

  expect(errors).toBeUndefined();
};
