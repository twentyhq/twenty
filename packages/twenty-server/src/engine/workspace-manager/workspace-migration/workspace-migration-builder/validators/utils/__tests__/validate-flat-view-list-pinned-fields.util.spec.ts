import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { validateFlatViewListPinnedFields } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-list-pinned-fields.util';

const buildFlatView = (listPinnedFieldUniversalIdentifiers: string[]) => ({
  objectMetadataUniversalIdentifier: 'object',
  listPinnedFieldUniversalIdentifiers,
});

const buildFlatFieldMetadataMaps = (
  objectMetadataUniversalIdentifier = 'object',
) => ({
  byUniversalIdentifier: {
    'pinned-field': getFlatFieldMetadataMock({
      universalIdentifier: 'pinned-field',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier,
      type: FieldMetadataType.TEXT,
    }),
  },
});

const getErrorMessages = (
  ...args: Parameters<typeof validateFlatViewListPinnedFields>
) => validateFlatViewListPinnedFields(...args).map((error) => error.message);

describe('validateFlatViewListPinnedFields', () => {
  it('accepts a view without pinned fields', () => {
    expect(
      getErrorMessages({
        flatView: buildFlatView([]),
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toEqual([]);
  });

  it('accepts a field of the view object', () => {
    expect(
      getErrorMessages({
        flatView: buildFlatView(['pinned-field']),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      }),
    ).toEqual([]);
  });

  it('rejects a field of another object', () => {
    expect(
      getErrorMessages({
        flatView: buildFlatView(['pinned-field']),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps('other-object'),
      }),
    ).toEqual(['List pinned fields must belong to the view object']);
  });

  it('rejects a field that does not exist', () => {
    expect(
      getErrorMessages({
        flatView: buildFlatView(['pinned-field']),
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toEqual(['List pinned field metadata not found']);
  });

  it('rejects the same field pinned twice', () => {
    expect(
      getErrorMessages({
        flatView: buildFlatView(['pinned-field', 'pinned-field']),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      }),
    ).toEqual(['List pinned fields must not contain the same field twice']);
  });
});
