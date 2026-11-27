import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateFlatViewListPinnedField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-list-pinned-field.util';

const buildFlatView = (
  listPinnedFieldMetadataUniversalIdentifier: string | null,
) => ({
  objectMetadataUniversalIdentifier: 'object',
  listPinnedFieldMetadataUniversalIdentifier,
});

const buildFlatFieldMetadataMaps = (
  flatFieldMetadata: Partial<FlatFieldMetadata>,
) => ({
  byUniversalIdentifier: {
    'list-pinned-field': getFlatFieldMetadataMock({
      universalIdentifier: 'list-pinned-field',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier: 'object',
      type: FieldMetadataType.TEXT,
      ...flatFieldMetadata,
    }),
  },
});

describe('validateFlatViewListPinnedField', () => {
  it('accepts a view without a list pinned field', () => {
    expect(
      validateFlatViewListPinnedField({
        flatView: buildFlatView(null),
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toEqual([]);
  });

  it('accepts a field of the view object', () => {
    expect(
      validateFlatViewListPinnedField({
        flatView: buildFlatView('list-pinned-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({}),
      }),
    ).toEqual([]);
  });

  it('rejects a field of another object', () => {
    expect(
      validateFlatViewListPinnedField({
        flatView: buildFlatView('list-pinned-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          objectMetadataUniversalIdentifier: 'other-object',
        }),
      }).map((error) => error.message),
    ).toEqual(['List pinned field must belong to the view object']);
  });

  it('rejects a field that does not exist', () => {
    expect(
      validateFlatViewListPinnedField({
        flatView: buildFlatView('list-pinned-field'),
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }).map((error) => error.message),
    ).toEqual(['List pinned field metadata not found']);
  });
});
