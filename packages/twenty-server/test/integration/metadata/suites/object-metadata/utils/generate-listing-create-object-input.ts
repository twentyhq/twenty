import {
  LISTING_LABEL_PLURAL,
  LISTING_LABEL_SINGULAR,
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/listing-object.constant';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export const getListingCreateObjectInput = (
  overrides?: Partial<Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>>,
) => ({
  namePlural: LISTING_NAME_PLURAL,
  nameSingular: LISTING_NAME_SINGULAR,
  labelPlural: LISTING_LABEL_PLURAL,
  labelSingular: LISTING_LABEL_SINGULAR,
  description: 'Listing object',
  icon: 'IconListNumbers',
  isLabelSyncedWithName: false,
  ...overrides,
});
