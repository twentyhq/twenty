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
          updatePayload: { color: object.color, icon: object.icon },
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
