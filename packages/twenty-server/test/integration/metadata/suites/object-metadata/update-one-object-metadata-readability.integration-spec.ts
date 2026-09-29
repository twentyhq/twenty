import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { MetadataReadability } from 'twenty-shared/types';

describe('Object metadata readability update', () => {
  let customObjectMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        labelPlural: 'Readability Tests',
        labelSingular: 'Readability Test',
        namePlural: 'readabilityTests',
        nameSingular: 'readabilityTest',
      },
    });

    customObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: customObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: customObjectMetadataId },
    });
  });

  it('should update the readability of a custom object', async () => {
    const { data: privateData } = await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: customObjectMetadataId,
        updatePayload: { readability: MetadataReadability.PRIVATE },
      },
      gqlFields: `
        id
        readability
      `,
    });

    expect(privateData.updateOneObject.readability).toBe(
      MetadataReadability.PRIVATE,
    );

    const { data: openData } = await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: customObjectMetadataId,
        updatePayload: { readability: MetadataReadability.OPEN },
      },
      gqlFields: `
        id
        readability
      `,
    });

    expect(openData.updateOneObject.readability).toBe(MetadataReadability.OPEN);
  });

  it.each([
    MetadataReadability.SYSTEM,
    MetadataReadability.APPLICATION,
    MetadataReadability.INHERITED,
  ])('should reject setting readability to %s', async (readability) => {
    const { errors } = await updateOneObjectMetadata({
      expectToFail: true,
      input: {
        idToUpdate: customObjectMetadataId,
        updatePayload: { readability },
      },
    });

    expect(errors?.[0]?.message).toContain(
      'readability must be one of the following values',
    );
  });

  it('should reject an unknown readability value', async () => {
    const { errors } = await updateOneObjectMetadata({
      expectToFail: true,
      input: {
        idToUpdate: customObjectMetadataId,
        updatePayload: {
          readability: 'NOT_A_READABILITY' as MetadataReadability,
        },
      },
    });

    expect(errors).toBeDefined();
  });

  it('should reject a null readability', async () => {
    const { errors } = await updateOneObjectMetadata({
      expectToFail: true,
      input: {
        idToUpdate: customObjectMetadataId,
        updatePayload: {
          readability: null as unknown as MetadataReadability,
        },
      },
    });

    expect(errors?.[0]?.message).toContain(
      'readability must be one of the following values',
    );
  });

  it('should reject a readability update on a standard object', async () => {
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

    const { errors } = await updateOneObjectMetadata({
      expectToFail: true,
      input: {
        idToUpdate: companyObject.id,
        updatePayload: { readability: MetadataReadability.PRIVATE },
      },
    });

    expect(errors?.[0]?.message).toContain(
      'Cannot edit standard object metadata properties: readability',
    );
  });
});
