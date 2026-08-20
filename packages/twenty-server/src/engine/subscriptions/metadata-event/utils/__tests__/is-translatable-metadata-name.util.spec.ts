import { isTranslatableMetadataName } from 'src/engine/subscriptions/metadata-event/utils/is-translatable-metadata-name.util';

describe('isTranslatableMetadataName', () => {
  it.each(['view', 'pageLayout', 'commandMenuItem', 'navigationMenuItem'])(
    'should accept %s',
    (metadataName) => {
      expect(isTranslatableMetadataName(metadataName)).toBe(true);
    },
  );

  it.each(['viewField', 'role', 'index'])(
    'should reject %s',
    (metadataName) => {
      expect(isTranslatableMetadataName(metadataName)).toBe(false);
    },
  );
});
