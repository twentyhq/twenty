import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-flat-entity-foreign-key-aggregator-properties.constant';

describe('ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES', () => {
  it('should match snapshot', () => {
    expect(
      Object.keys(ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES),
    ).toMatchObject(Object.values(ALL_METADATA_NAME));
    expect(
      ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES,
    ).toMatchSnapshot();
  });
});
