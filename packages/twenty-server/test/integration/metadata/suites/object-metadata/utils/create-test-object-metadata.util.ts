import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { capitalize } from 'twenty-shared';

type CreateListingCustomObjectParams = {
  nameSingular?: string;
  labelSingular?: string;
  description?: string;
};

export const createListingCustomObject = async ({
  nameSingular = 'listing',
  labelSingular,
  description,
}: CreateListingCustomObjectParams = {}) => {
  const defaultLabelSingular = capitalize(nameSingular);
  const namePlural = `${nameSingular}s`;
  const labelPlural = `${labelSingular || defaultLabelSingular}s`;

  const LISTING_OBJECT = {
    namePlural,
    nameSingular,
    labelPlural,
    labelSingular: labelSingular || defaultLabelSingular,
    description:
      description || `${labelSingular || defaultLabelSingular} object`,
    icon: 'IconListNumbers',
    isLabelSyncedWithName: false,
  };

  const createObjectOperation = createOneObjectMetadataFactory({
    input: { object: LISTING_OBJECT },
    gqlFields: `
            id
            nameSingular
        `,
  });

  const response = await makeMetadataAPIRequest(createObjectOperation);

  return {
    objectMetadataId: response.body.data.createOneObject.id,
  };
};
