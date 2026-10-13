import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataEventRecordVisible } from 'src/engine/subscriptions/metadata-event/utils/is-field-metadata-event-record-visible.util';

const MORPH_ID = 'morph-id';

const group = {
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: MORPH_ID,
  morphId: MORPH_ID,
};

const target = {
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: 'target',
  morphId: MORPH_ID,
};

const flatFieldMetadataMapsWithGroup = {
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: {
    [MORPH_ID]: group as FlatFieldMetadata,
  },
};

describe('isFieldMetadataEventRecordVisible', () => {
  it('should keep events of fields that are not morph relations', () => {
    expect(
      isFieldMetadataEventRecordVisible({
        record: {
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'text',
        },
        isMorphFieldGroupEnabled: true,
        flatFieldMetadataMaps: flatFieldMetadataMapsWithGroup,
      }),
    ).toBe(true);
  });

  it.each([
    [false, false],
    [true, true],
  ])(
    'should show group events only when morph field groups are enabled (enabled: %s)',
    (isMorphFieldGroupEnabled, expected) => {
      expect(
        isFieldMetadataEventRecordVisible({
          record: group,
          isMorphFieldGroupEnabled,
          flatFieldMetadataMaps: flatFieldMetadataMapsWithGroup,
        }),
      ).toBe(expected);
    },
  );

  it('should keep target events when morph field groups are disabled', () => {
    expect(
      isFieldMetadataEventRecordVisible({
        record: target,
        isMorphFieldGroupEnabled: false,
        flatFieldMetadataMaps: flatFieldMetadataMapsWithGroup,
      }),
    ).toBe(true);
  });

  it('should hide target events behind an existing group', () => {
    expect(
      isFieldMetadataEventRecordVisible({
        record: target,
        isMorphFieldGroupEnabled: true,
        flatFieldMetadataMaps: flatFieldMetadataMapsWithGroup,
      }),
    ).toBe(false);
  });

  it('should keep target events while the group is not backfilled', () => {
    expect(
      isFieldMetadataEventRecordVisible({
        record: target,
        isMorphFieldGroupEnabled: true,
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      }),
    ).toBe(true);
  });
});
