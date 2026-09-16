import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateManyObjectsMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-many-objects-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

describe('Bulk object metadata update', () => {
  let companyObject: ObjectMetadataDTO;
  let personObject: ObjectMetadataDTO;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: `
        id
        nameSingular
        labelSingular
        color
        icon
      `,
    });

    const company = objects.find((object) => object.nameSingular === 'company');
    const person = objects.find((object) => object.nameSingular === 'person');

    jestExpectToBeDefined(company);
    jestExpectToBeDefined(person);
    companyObject = company;
    personObject = person;
  });

  afterEach(async () => {
    for (const object of [companyObject, personObject]) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: object.id,
          updatePayload: {
            color: object.color,
            icon: object.icon,
            labelSingular: object.labelSingular,
          },
        },
      });
    }
  });

  it('should update every object in the batch', async () => {
    const { data } = await updateManyObjectsMetadata({
      expectToFail: false,
      input: {
        updates: [
          { id: companyObject.id, update: { color: 'red' } },
          { id: personObject.id, update: { color: 'purple' } },
        ],
      },
      gqlFields: `
        id
        color
      `,
    });

    const updatedById = new Map(
      data.updateManyObjects.map((object) => [object.id, object]),
    );

    expect(updatedById.get(companyObject.id)?.color).toBe('red');
    expect(updatedById.get(personObject.id)?.color).toBe('purple');
  });

  it('should apply a batch of label updates', async () => {
    const { data } = await updateManyObjectsMetadata({
      expectToFail: false,
      input: {
        updates: [
          { id: companyObject.id, update: { labelSingular: 'Business' } },
          { id: personObject.id, update: { labelSingular: 'Human' } },
        ],
      },
      gqlFields: `
        id
        labelSingular
      `,
    });

    const updatedById = new Map(
      data.updateManyObjects.map((object) => [object.id, object]),
    );

    expect(updatedById.get(companyObject.id)?.labelSingular).toBe('Business');
    expect(updatedById.get(personObject.id)?.labelSingular).toBe('Human');
  });

  // Renames take the sequential fallback: batching them can emit the same
  // related index twice and the transpiler rejects the duplicate.
  it('should apply every rename in a batch', async () => {
    const suffix = Date.now().toString().slice(-8);
    const createdObjectIds: string[] = [];

    for (const index of [1, 2]) {
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          nameSingular: `bulkRenameSource${index}${suffix}`,
          namePlural: `bulkRenameSources${index}${suffix}`,
          labelSingular: `Bulk Rename Source ${index} ${suffix}`,
          labelPlural: `Bulk Rename Sources ${index} ${suffix}`,
          isLabelSyncedWithName: false,
        },
        gqlFields: 'id',
      });

      createdObjectIds.push(data.createOneObject.id);
    }

    try {
      const { data } = await updateManyObjectsMetadata({
        expectToFail: false,
        input: {
          updates: createdObjectIds.map((id, index) => ({
            id,
            update: {
              nameSingular: `bulkRenamed${index + 1}${suffix}`,
              namePlural: `bulkRenamed${index + 1}s${suffix}`,
            },
          })),
        },
        gqlFields: `
          id
          nameSingular
        `,
      });

      const renamedById = new Map(
        data.updateManyObjects.map((object) => [object.id, object]),
      );

      createdObjectIds.forEach((id, index) => {
        expect(renamedById.get(id)?.nameSingular).toBe(
          `bulkRenamed${index + 1}${suffix}`,
        );
      });
    } finally {
      for (const id of createdObjectIds) {
        await deleteOneObjectMetadata({
          expectToFail: false,
          input: { idToDelete: id },
        });
      }
    }
  });

  it('should reject a batch updating the same object twice', async () => {
    const { errors } = await updateManyObjectsMetadata({
      expectToFail: true,
      input: {
        updates: [
          { id: companyObject.id, update: { color: 'red' } },
          { id: companyObject.id, update: { color: 'blue' } },
        ],
      },
    });

    expect(errors).toBeDefined();
  });
});
