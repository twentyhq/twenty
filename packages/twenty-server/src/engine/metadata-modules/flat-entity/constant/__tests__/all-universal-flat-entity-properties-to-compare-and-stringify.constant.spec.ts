import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';

describe('ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY', () => {
  it('should match snapshot', () => {
    expect(
      Object.keys(
        ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY,
      ),
    ).toMatchObject(Object.values(ALL_METADATA_NAME));
    expect(
      ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY,
    ).toMatchSnapshot();
  });
});
