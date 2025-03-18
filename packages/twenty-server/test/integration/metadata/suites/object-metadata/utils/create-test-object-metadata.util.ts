import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const LISTING_NAME_SINGULAR = 'listing';
export const LISTING_NAME_PLURAL = 'listings';

const LISTING_OBJECT = {
  namePlural: LISTING_NAME_PLURAL,
  nameSingular: LISTING_NAME_SINGULAR,
  labelPlural: 'Listings',
  labelSingular: 'Listing',
  description: 'Listing object',
  icon: 'IconListNumbers',
  isLabelSyncedWithName: false,
};

export const createListingCustomObject = async () => {
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
