import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

type FetchedField = {
  id: string;
  name: string;
};

const getCompanyImageIdentifier = async (): Promise<string | null> => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: `
      id
      nameSingular
      imageIdentifierFieldMetadataId
    `,
  });

  const company = objects.find((object) => object.nameSingular === 'company');

  jestExpectToBeDefined(company);

  return company.imageIdentifierFieldMetadataId ?? null;
};

describe('Standard object image identifier override should succeed', () => {
  let companyObjectMetadataId: string;
  let originalImageIdentifierFieldMetadataId: string | null;
  let linkedinLinkFieldId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: `
        id
        nameSingular
        imageIdentifierFieldMetadataId
      `,
    });

    const company = objects.find((object) => object.nameSingular === 'company');

    jestExpectToBeDefined(company);
    companyObjectMetadataId = company.id;
    originalImageIdentifierFieldMetadataId =
      company.imageIdentifierFieldMetadataId ?? null;

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: companyObjectMetadataId } },
        paging: { first: 100 },
      },
      gqlFields: 'id name type',
    });

    const linkedinLinkField = fields
      .map((edge: { node: FetchedField }) => edge.node)
      .find((field: FetchedField) => field.name === 'linkedinLink');

    jestExpectToBeDefined(linkedinLinkField);
    linkedinLinkFieldId = linkedinLinkField.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: companyObjectMetadataId,
        updatePayload: {
          imageIdentifierFieldMetadataId:
            originalImageIdentifierFieldMetadataId ?? undefined,
        },
      },
    });
  });

  it('stores a non-default image identifier in overrides and resolves it', async () => {
    const {
      data: { updateOneObject },
      errors,
    } = await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: companyObjectMetadataId,
        updatePayload: {
          imageIdentifierFieldMetadataId: linkedinLinkFieldId,
        },
      },
      gqlFields: `
        id
        imageIdentifierFieldMetadataId
      `,
    });

    expect(errors).toBeUndefined();
    expect(updateOneObject.imageIdentifierFieldMetadataId).toBe(
      linkedinLinkFieldId,
    );
  });

  it('persists the overridden image identifier across refetch', async () => {
    const imageIdentifierFieldMetadataId = await getCompanyImageIdentifier();

    expect(imageIdentifierFieldMetadataId).toBe(linkedinLinkFieldId);
  });

  it('respects an explicit null override instead of falling back to the base value', async () => {
    const {
      data: { updateOneObject },
      errors,
    } = await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: companyObjectMetadataId,
        updatePayload: {
          imageIdentifierFieldMetadataId: null,
        },
      },
      gqlFields: `
        id
        imageIdentifierFieldMetadataId
      `,
    });

    expect(errors).toBeUndefined();
    expect(updateOneObject.imageIdentifierFieldMetadataId).toBeNull();

    const imageIdentifierFieldMetadataId = await getCompanyImageIdentifier();

    expect(imageIdentifierFieldMetadataId).toBeNull();
    expect(isDefined(imageIdentifierFieldMetadataId)).toBe(false);
  });
});
