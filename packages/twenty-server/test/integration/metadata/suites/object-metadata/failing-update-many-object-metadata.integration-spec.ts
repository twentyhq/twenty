import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
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

  // A rename cannot share a migration with another update, and splitting the
  // batch would commit the other objects before a failing rename. The renamed
  // object has to be a custom one: nameSingular is not editable on standard
  // objects, which would make this pass whether or not the batch is refused.
  it('when a rename shares a batch with another object', async () => {
    const suffix = Date.now().toString().slice(-8);
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: `bulkRenameGuard${suffix}`,
        namePlural: `bulkRenameGuards${suffix}`,
        labelSingular: `Bulk Rename Guard ${suffix}`,
        labelPlural: `Bulk Rename Guards ${suffix}`,
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id',
    });
    const customObjectMetadataId = data.createOneObject.id;

    try {
      const { errors } = await updateManyObjectsMetadata({
        expectToFail: true,
        input: {
          inputs: [
            { id: companyObjectMetadataId, update: { color: 'red' } },
            {
              id: customObjectMetadataId,
              update: { nameSingular: `bulkRenamed${suffix}` },
            },
          ],
        },
      });

      expect(errors).toBeDefined();
    } finally {
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: customObjectMetadataId },
      });
    }
  });
});
