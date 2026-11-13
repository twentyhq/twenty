import { type FieldMetadataComplexOption } from 'twenty-shared/types';

import { normalizeUpdatedFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/normalize-updated-field-metadata-options.util';

const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';

const openOption: FieldMetadataComplexOption = {
  id: OPEN_OPTION_ID,
  value: 'OPEN',
  label: 'Open',
  color: 'green',
  position: 0,
};
const closedOption: FieldMetadataComplexOption = {
  id: CLOSED_OPTION_ID,
  value: 'CLOSED',
  label: 'Closed',
  color: 'red',
  position: 1,
};
const existingOptions = [openOption, closedOption];

describe('normalizeUpdatedFieldMetadataOptions', () => {
  it('keeps the ids of options sent without one, matched by value', () => {
    const normalizedOptions =
      normalizeUpdatedFieldMetadataOptions<FieldMetadataComplexOption>({
        updatedOptions: [
          { value: 'CLOSED', label: 'Done', color: 'blue', position: 0 },
          { value: 'OPEN', label: 'Open', color: 'green', position: 1 },
          { value: 'ARCHIVED', label: 'Archived', color: 'gray', position: 2 },
        ],
        existingOptions,
      });

    expect(normalizedOptions.slice(0, 2).map(({ id }) => id)).toEqual([
      CLOSED_OPTION_ID,
      OPEN_OPTION_ID,
    ]);
    expect(existingOptions.map(({ id }) => id)).not.toContain(
      normalizedOptions[2].id,
    );
  });

  it('keeps an id the input provides and gives same-value options distinct ids', () => {
    const PROVIDED_OPTION_ID = '20202020-0000-4000-8000-000000000999';
    const normalizedOptions =
      normalizeUpdatedFieldMetadataOptions<FieldMetadataComplexOption>({
        updatedOptions: [
          { ...openOption, id: PROVIDED_OPTION_ID },
          { value: 'CLOSED', label: 'Closed', color: 'red', position: 1 },
          { value: 'CLOSED', label: 'Closed again', color: 'red', position: 2 },
        ],
        existingOptions,
      });

    expect(normalizedOptions[0].id).toBe(PROVIDED_OPTION_ID);
    expect(normalizedOptions[1].id).toBe(CLOSED_OPTION_ID);
    expect(normalizedOptions[2].id).not.toBe(CLOSED_OPTION_ID);
  });

  it('only stores isActive when an option is inactive and never stores the option owner', () => {
    expect(
      normalizeUpdatedFieldMetadataOptions({
        updatedOptions: [
          { ...openOption, isActive: true },
          {
            ...closedOption,
            isActive: false,
            applicationId: '20202020-0000-4000-8000-0000000000bb',
          },
        ],
        existingOptions,
      }),
    ).toEqual([openOption, { ...closedOption, isActive: false }]);
  });
});
