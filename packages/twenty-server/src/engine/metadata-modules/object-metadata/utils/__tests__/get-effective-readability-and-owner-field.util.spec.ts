import { MetadataReadability } from 'twenty-shared/types';

import { getEffectiveOwnerFieldMetadataId } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-owner-field-metadata-id.util';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';

const OWNER_FIELD_METADATA_ID = '20202020-0000-4000-8000-000000000001';
const OVERRIDDEN_OWNER_FIELD_METADATA_ID =
  '20202020-0000-4000-8000-000000000002';

describe('getEffectiveReadability', () => {
  it('returns the column value when there is no override', () => {
    expect(
      getEffectiveReadability({
        readability: MetadataReadability.OPEN,
        overrides: null,
      }),
    ).toBe(MetadataReadability.OPEN);
    expect(
      getEffectiveReadability({
        readability: MetadataReadability.INHERITED,
        overrides: { icon: 'IconLock' },
      }),
    ).toBe(MetadataReadability.INHERITED);
  });

  it('returns the override when the workspace changed the level', () => {
    expect(
      getEffectiveReadability({
        readability: MetadataReadability.OPEN,
        overrides: { readability: MetadataReadability.PRIVATE },
      }),
    ).toBe(MetadataReadability.PRIVATE);
  });

  it('falls back to the column when the override is null', () => {
    expect(
      getEffectiveReadability({
        readability: MetadataReadability.PRIVATE,
        overrides: { readability: null },
      }),
    ).toBe(MetadataReadability.PRIVATE);
  });
});

describe('getEffectiveOwnerFieldMetadataId', () => {
  it('returns the column value when there is no override', () => {
    expect(
      getEffectiveOwnerFieldMetadataId({
        ownerFieldMetadataId: OWNER_FIELD_METADATA_ID,
        overrides: null,
      }),
    ).toBe(OWNER_FIELD_METADATA_ID);
    expect(
      getEffectiveOwnerFieldMetadataId({
        ownerFieldMetadataId: null,
        overrides: { icon: 'IconLock' },
      }),
    ).toBeNull();
  });

  it('returns the override when the workspace chose another owner field', () => {
    expect(
      getEffectiveOwnerFieldMetadataId({
        ownerFieldMetadataId: OWNER_FIELD_METADATA_ID,
        overrides: { ownerFieldMetadataId: OVERRIDDEN_OWNER_FIELD_METADATA_ID },
      }),
    ).toBe(OVERRIDDEN_OWNER_FIELD_METADATA_ID);
  });

  it('respects an explicit null override instead of the column value', () => {
    expect(
      getEffectiveOwnerFieldMetadataId({
        ownerFieldMetadataId: OWNER_FIELD_METADATA_ID,
        overrides: { ownerFieldMetadataId: null },
      }),
    ).toBeNull();
  });
});
