import { FieldMetadataType } from 'twenty-shared/types';

import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';

const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';

const storedOptions = [
  {
    id: OPEN_OPTION_ID,
    value: 'OPEN',
    label: 'Stored open',
    color: 'green' as const,
    position: 0,
  },
];

describe('resolveFieldMetadataOptionsFromRows', () => {
  it('builds the options from the rows, ordered by position', () => {
    expect(
      resolveFieldMetadataOptionsFromRows({
        fieldMetadataEntity: {
          type: FieldMetadataType.SELECT,
          options: storedOptions,
        },
        fieldMetadataOptionRows: [
          {
            universalIdentifier: CLOSED_OPTION_ID,
            value: 'CLOSED',
            label: 'Closed',
            color: null,
            position: 1,
          },
          {
            universalIdentifier: OPEN_OPTION_ID,
            value: 'OPEN',
            label: 'Open',
            color: 'green',
            position: 0,
          },
        ],
      }),
    ).toEqual([
      {
        id: OPEN_OPTION_ID,
        value: 'OPEN',
        label: 'Open',
        color: 'green',
        position: 0,
      },
      { id: CLOSED_OPTION_ID, value: 'CLOSED', label: 'Closed', position: 1 },
    ]);
  });

  it('keeps the stored options of a field without rows', () => {
    expect(
      resolveFieldMetadataOptionsFromRows({
        fieldMetadataEntity: {
          type: FieldMetadataType.SELECT,
          options: storedOptions,
        },
        fieldMetadataOptionRows: [],
      }),
    ).toBe(storedOptions);
  });
});
