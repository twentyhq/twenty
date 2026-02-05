import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { ALL_UNIVERSAL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-metadata-relations.constant';

describe('ALL_UNIVERSAL_METADATA_RELATIONS', () => {
  it('should have an entry for each metadata name', () => {
    expect(Object.keys(ALL_UNIVERSAL_METADATA_RELATIONS)).toMatchObject(
      Object.values(ALL_METADATA_NAME),
    );
  });

  it('should match snapshot', () => {
    expect(ALL_UNIVERSAL_METADATA_RELATIONS).toMatchSnapshot();
  });
});
