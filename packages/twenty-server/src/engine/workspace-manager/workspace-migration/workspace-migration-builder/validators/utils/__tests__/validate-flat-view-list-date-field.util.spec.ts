import { FieldMetadataType, ViewType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { validateFlatViewListDateField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-list-date-field.util';

const buildFlatView = (
  listDateFieldMetadataUniversalIdentifier: string | null,
) =>
  ({
    type: ViewType.LIST,
    objectMetadataUniversalIdentifier: 'object',
    listDateFieldMetadataUniversalIdentifier,
  }) as UniversalFlatView;

const buildFlatFieldMetadataMaps = (
  flatFieldMetadata: Partial<UniversalFlatFieldMetadata>,
) => ({
  byUniversalIdentifier: {
    'list-date-field': {
      universalIdentifier: 'list-date-field',
      objectMetadataUniversalIdentifier: 'object',
      type: FieldMetadataType.DATE_TIME,
      ...flatFieldMetadata,
    } as UniversalFlatFieldMetadata,
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
