import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateManyObjectsMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-many-objects-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('Bulk object metadata update should fail', () => {
  let companyObjectMetadataId: string;
  let companyColor: string | undefined;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: `
        id
        nameSingular
        color
      `,
    });

    const companyObject = objects.find(
      (object) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObject);
    companyObjectMetadataId = companyObject.id;
    companyColor = companyObject.color;
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

    expectOneNotInternalServerErrorSnapshot({ errors });
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

      expectOneNotInternalServerErrorSnapshot({ errors });
    } finally {
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: customObjectMetadataId },
      });
    }
  });

  it('when an input fails the payload validators', async () => {
    const { errors } = await updateManyObjectsMetadata({
      expectToFail: true,
      input: {
        inputs: [
          { id: companyObjectMetadataId, update: { color: 'red' } },
          { id: companyObjectMetadataId, update: { nameSingular: 'and' } },
        ],
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  // Pointing an object at a label identifier that is not in its search vector
  // rebuilds that vector and rewrites the table, so batching several would hold
  // an exclusive lock on each one until the whole migration commits.
  it('when a label identifier update shares a batch with another object', async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: `
        id
        nameSingular
        labelIdentifierFieldMetadataId
      `,
    });

    const personObject = objects.find(
      (object) => object.nameSingular === 'person',
    );

    jestExpectToBeDefined(personObject);

    const { labelIdentifierFieldMetadataId } = personObject;

    jestExpectToBeDefined(labelIdentifierFieldMetadataId);

    const { errors } = await updateManyObjectsMetadata({
      expectToFail: true,
      input: {
        inputs: [
          { id: companyObjectMetadataId, update: { color: 'red' } },
          {
            id: personObject.id,
            update: { labelIdentifierFieldMetadataId },
          },
        ],
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('and leaves every object in the batch untouched', async () => {
    await updateManyObjectsMetadata({
      expectToFail: true,
      input: {
        inputs: [
          { id: companyObjectMetadataId, update: { color: 'red' } },
          { id: companyObjectMetadataId, update: { color: 'blue' } },
        ],
      },
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: `
        id
        color
      `,
    });

    expect(
      objects.find((object) => object.id === companyObjectMetadataId)?.color,
    ).toBe(companyColor);
  });
});
