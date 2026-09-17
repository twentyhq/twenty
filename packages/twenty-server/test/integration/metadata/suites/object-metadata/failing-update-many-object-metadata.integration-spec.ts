import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateManyObjectsMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-many-objects-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('Bulk object metadata update should fail', () => {
  let companyObjectMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: `
        id
        nameSingular
      `,
    });

    const companyObject = objects.find(
      (object) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObject);
    companyObjectMetadataId = companyObject.id;
  });

  // Every conversion is computed against the pre-update maps, so a second
  // update to the same object would be built from stale state.
  it('when the same object appears twice in one batch', async () => {
    const { errors } = await updateManyObjectsMetadata({
      expectToFail: true,
      input: {
        inputs: [
          { id: companyObjectMetadataId, update: { color: 'red' } },
          { id: companyObjectMetadataId, update: { color: 'blue' } },
        ],
      },
    });

    expect(errors).toBeDefined();
  });
});
