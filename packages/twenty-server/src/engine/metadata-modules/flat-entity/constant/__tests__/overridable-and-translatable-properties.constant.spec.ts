import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';

describe('registry-derived override property maps', () => {
  it('derives the overridable properties for every metadata entity', () => {
    expect(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME).toMatchSnapshot();
  });

  it('derives the translatable properties for every metadata entity', () => {
    expect(ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME).toMatchSnapshot();
  });
});
