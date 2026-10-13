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
const target = { ...group, universalIdentifier: 'target' };
const text = { type: FieldMetadataType.TEXT, universalIdentifier: 'text' };
const mapsWithGroup = {
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: { [MORPH_ID]: group as FlatFieldMetadata },
};
const mapsWithoutGroup = createEmptyFlatEntityMaps();

describe('isFieldMetadataEventRecordVisible', () => {
  it.each([
    ['a non morph field', text, true, mapsWithGroup, true],
    ['a group while disabled', group, false, mapsWithGroup, false],
    ['a group while enabled', group, true, mapsWithGroup, true],
    ['a target while disabled', target, false, mapsWithGroup, true],
    [
      'a target behind a group while enabled',
      target,
      true,
      mapsWithGroup,
      false,
    ],
    ['a target not backfilled yet', target, true, mapsWithoutGroup, true],
  ])(
    'should return the right visibility for %s',
    (_, record, isMorphFieldGroupEnabled, flatFieldMetadataMaps, expected) => {
      expect(
        isFieldMetadataEventRecordVisible({
          record,
          isMorphFieldGroupEnabled,
          flatFieldMetadataMaps,
        }),
      ).toBe(expected);
    },
  );
});
