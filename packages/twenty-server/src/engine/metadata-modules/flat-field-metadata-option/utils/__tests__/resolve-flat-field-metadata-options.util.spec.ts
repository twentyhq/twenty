import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { resolveFlatFieldMetadataOptionsFromCachedMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options-from-cached-maps.util';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';

const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';

const buildOptionRow = (
  optionRow: Pick<
    FlatFieldMetadataOption,
    'universalIdentifier' | 'value' | 'label' | 'position'
  >,
): FlatFieldMetadataOption =>
  ({
    color: null,
    isActive: true,
    overrides: null,
    ...optionRow,
  }) as FlatFieldMetadataOption;

const flatFieldMetadataOptionMaps = {
  byUniversalIdentifier: {
    [OPEN_OPTION_ID]: buildOptionRow({
      universalIdentifier: OPEN_OPTION_ID,
      value: 'OPEN',
      label: 'Open',
      position: 0,
    }),
    [CLOSED_OPTION_ID]: buildOptionRow({
      universalIdentifier: CLOSED_OPTION_ID,
      value: 'CLOSED',
      label: 'Closed',
      position: 1,
    }),
  },
};

const storedOpenOption = {
  id: OPEN_OPTION_ID,
  value: 'OPEN',
  label: 'Stored open',
  color: 'green' as const,
  position: 0,
};

describe('resolveFlatFieldMetadataOptions', () => {
  it('reads the options of a field from its option rows', () => {
    expect(
      resolveFlatFieldMetadataOptions({
        flatFieldMetadata: {
          type: FieldMetadataType.SELECT,
          options: [storedOpenOption],
          fieldMetadataOptionUniversalIdentifiers: [
            CLOSED_OPTION_ID,
            OPEN_OPTION_ID,
          ],
        },
        flatFieldMetadataOptionMaps,
      }),
    ).toEqual([
      { id: OPEN_OPTION_ID, value: 'OPEN', label: 'Open', position: 0 },
      { id: CLOSED_OPTION_ID, value: 'CLOSED', label: 'Closed', position: 1 },
    ]);
  });

  it('keeps the stored options while a stored option has no row', () => {
    const storedOptions = [
      storedOpenOption,
      { id: 'legacy', value: 'LEGACY', label: 'Legacy', position: 1 },
    ];

    expect(
      resolveFlatFieldMetadataOptions({
        flatFieldMetadata: {
          type: FieldMetadataType.SELECT,
          options: storedOptions,
          fieldMetadataOptionUniversalIdentifiers: [OPEN_OPTION_ID],
        },
        flatFieldMetadataOptionMaps,
      }),
    ).toEqual(storedOptions);
  });

  it('keeps the stored options when the option maps are not provided', () => {
    expect(
      resolveFlatFieldMetadataOptions({
        flatFieldMetadata: {
          type: FieldMetadataType.SELECT,
          options: [storedOpenOption],
          fieldMetadataOptionUniversalIdentifiers: [OPEN_OPTION_ID],
        },
        flatFieldMetadataOptionMaps: undefined,
      }),
    ).toEqual([storedOpenOption]);
  });
});

describe('resolveFlatFieldMetadataOptionsFromCachedMaps', () => {
  it('resolves a field once per option maps', () => {
    const flatFieldMetadata = {
      type: FieldMetadataType.SELECT,
      options: [storedOpenOption],
      fieldMetadataOptionUniversalIdentifiers: [OPEN_OPTION_ID],
    };

    const firstOptions = resolveFlatFieldMetadataOptionsFromCachedMaps({
      flatFieldMetadata,
      flatFieldMetadataOptionMaps,
    });

    expect(firstOptions).toEqual([
      { id: OPEN_OPTION_ID, value: 'OPEN', label: 'Open', position: 0 },
    ]);
    expect(
      resolveFlatFieldMetadataOptionsFromCachedMaps({
        flatFieldMetadata,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(firstOptions);
    expect(
      resolveFlatFieldMetadataOptionsFromCachedMaps({
        flatFieldMetadata,
        flatFieldMetadataOptionMaps: { ...flatFieldMetadataOptionMaps },
      }),
    ).not.toBe(firstOptions);
  });
});
