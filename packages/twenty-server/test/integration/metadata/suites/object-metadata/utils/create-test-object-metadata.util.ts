import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const LISTING_NAME_SINGULAR = 'listing';

const LISTING_OBJECT = {
  namePlural: 'listings',
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
