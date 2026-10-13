import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataEventRecordVisible } from 'src/engine/subscriptions/metadata-event/utils/is-field-metadata-event-record-visible.util';

const MORPH_ID = 'morph-id';
const head = {
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: MORPH_ID,
  morphId: MORPH_ID,
};
const target = { ...head, universalIdentifier: 'target' };
const text = { type: FieldMetadataType.TEXT, universalIdentifier: 'text' };
const mapsWithHead = {
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: { [MORPH_ID]: head as FlatFieldMetadata },
};
const mapsWithoutHead = createEmptyFlatEntityMaps();

describe('isFieldMetadataEventRecordVisible', () => {
  it.each([
    ['a non morph field', text, true, mapsWithHead, true],
    ['a head while disabled', head, false, mapsWithHead, false],
    ['a head while enabled', head, true, mapsWithHead, true],
    ['a target while disabled', target, false, mapsWithHead, true],
    ['a target behind a head while enabled', target, true, mapsWithHead, false],
    ['a target not backfilled yet', target, true, mapsWithoutHead, true],
  ])(
    'should return the right visibility for %s',
    (
      _,
      record,
      isMorphRelationHeadEnabled,
      flatFieldMetadataMaps,
      expected,
    ) => {
      expect(
        isFieldMetadataEventRecordVisible({
          record,
          isMorphRelationHeadEnabled,
          flatFieldMetadataMaps,
        }),
      ).toBe(expected);
    },
  );
});
