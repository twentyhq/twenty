import {
  HOUSE_LABEL_PLURAL,
  HOUSE_LABEL_SINGULAR,
  HOUSE_NAME_PLURAL,
  HOUSE_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/house-object.constant';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export const getHouseCreateObjectInput = (
  overrides?: Partial<Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>>,
) => ({
  namePlural: HOUSE_NAME_PLURAL,
  nameSingular: HOUSE_NAME_SINGULAR,
  labelPlural: HOUSE_LABEL_PLURAL,
  labelSingular: HOUSE_LABEL_SINGULAR,
  description: 'Listing object',
  icon: 'IconListNumbers',
  isLabelSyncedWithName: false,
  ...overrides,
});
