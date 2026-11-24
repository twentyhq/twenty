import { FieldMetadataType } from 'twenty-shared/types';

import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';

const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';
const APP_ARCHIVED_OPTION_ID = '20202020-0000-4000-8000-000000000103';
const WORKSPACE_PENDING_OPTION_ID = '20202020-0000-4000-8000-000000000104';

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

  it('re-indexes positions in universal identifier order when rows of different applications share one', () => {
    const fieldMetadataOptionRows = [
      {
        universalIdentifier: WORKSPACE_PENDING_OPTION_ID,
        value: 'PENDING',
        label: 'Pending',
        color: null,
        position: 2,
      },
      {
        universalIdentifier: OPEN_OPTION_ID,
        value: 'OPEN',
        label: 'Open',
        color: null,
        position: 0,
      },
      {
        universalIdentifier: APP_ARCHIVED_OPTION_ID,
        value: 'ARCHIVED',
        label: 'Archived',
        color: null,
        position: 2,
      },
      {
        universalIdentifier: CLOSED_OPTION_ID,
        value: 'CLOSED',
        label: 'Closed',
        color: null,
        position: 1,
      },
    ];

    expect(
      resolveFieldMetadataOptionsFromRows({
        fieldMetadataEntity: { type: FieldMetadataType.SELECT },
        fieldMetadataOptionRows,
      }),
    ).toEqual([
      { id: OPEN_OPTION_ID, value: 'OPEN', label: 'Open', position: 0 },
      { id: CLOSED_OPTION_ID, value: 'CLOSED', label: 'Closed', position: 1 },
      {
        id: APP_ARCHIVED_OPTION_ID,
        value: 'ARCHIVED',
        label: 'Archived',
        position: 2,
      },
      {
        id: WORKSPACE_PENDING_OPTION_ID,
        value: 'PENDING',
        label: 'Pending',
        position: 3,
      },
    ]);
  });

  it('keeps distinct row positions that are not sequential', () => {
    expect(
      resolveFieldMetadataOptionsFromRows({
        fieldMetadataEntity: { type: FieldMetadataType.SELECT },
        fieldMetadataOptionRows: [
          {
            universalIdentifier: CLOSED_OPTION_ID,
            value: 'CLOSED',
            label: 'Closed',
            color: null,
            position: 5,
          },
          {
            universalIdentifier: OPEN_OPTION_ID,
            value: 'OPEN',
            label: 'Open',
            color: null,
            position: 1,
          },
        ],
      })?.map(({ position }) => position),
    ).toEqual([1, 5]);
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
