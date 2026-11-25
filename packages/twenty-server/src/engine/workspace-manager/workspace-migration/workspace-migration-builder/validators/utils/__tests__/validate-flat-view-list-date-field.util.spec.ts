import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateFlatViewListDateField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-list-date-field.util';

const buildFlatView = (
  listDateFieldMetadataUniversalIdentifier: string | null,
) => ({
  objectMetadataUniversalIdentifier: 'object',
  listDateFieldMetadataUniversalIdentifier,
});

const buildFlatFieldMetadataMaps = (
  flatFieldMetadata: Partial<FlatFieldMetadata>,
) => ({
  byUniversalIdentifier: {
    'list-date-field': getFlatFieldMetadataMock({
      universalIdentifier: 'list-date-field',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier: 'object',
      type: FieldMetadataType.DATE_TIME,
      ...flatFieldMetadata,
    }),
  },
});

describe('validateFlatViewListDateField', () => {
  it('accepts a view without a list date field', () => {
    expect(
      validateFlatViewListDateField({
        flatView: buildFlatView(null),
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toEqual([]);
  });

  it.each([FieldMetadataType.DATE, FieldMetadataType.DATE_TIME])(
    'accepts a %s field of the view object',
    (type) => {
      expect(
        validateFlatViewListDateField({
          flatView: buildFlatView('list-date-field'),
          flatFieldMetadataMaps: buildFlatFieldMetadataMaps({ type }),
        }),
      ).toEqual([]);
    },
  );

  it('rejects a field that is not a date', () => {
    expect(
      validateFlatViewListDateField({
        flatView: buildFlatView('list-date-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          type: FieldMetadataType.TEXT,
        }),
      }).map((error) => error.message),
    ).toEqual(['List date field must be a date or date time field']);
  });

  it('rejects a date field of another object', () => {
    expect(
      validateFlatViewListDateField({
        flatView: buildFlatView('list-date-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          objectMetadataUniversalIdentifier: 'other-object',
        }),
      }).map((error) => error.message),
    ).toEqual(['List date field must belong to the view object']);
  });

  it('rejects a field that does not exist', () => {
    expect(
      validateFlatViewListDateField({
        flatView: buildFlatView('list-date-field'),
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }).map((error) => error.message),
    ).toEqual(['List date field metadata not found']);
  });
});
