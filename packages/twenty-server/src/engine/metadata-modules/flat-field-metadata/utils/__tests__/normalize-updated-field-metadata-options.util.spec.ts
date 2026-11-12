import { type FieldMetadataComplexOption } from 'twenty-shared/types';

import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { normalizeUpdatedFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/normalize-updated-field-metadata-options.util';

const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';
const ARCHIVED_OPTION_ID = '20202020-0000-4000-8000-000000000103';

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
const archivedCustomOption: FieldMetadataComplexOption = {
  id: ARCHIVED_OPTION_ID,
  value: 'ARCHIVED',
  label: 'Archived',
  color: 'gray',
  position: 2,
  isCustom: true,
};
const existingOptions = [openOption, closedOption, archivedCustomOption];

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
        isFieldOwnedByAnotherApplication: true,
      });

    expect(normalizedOptions.map(({ id }) => id)).toEqual([
      CLOSED_OPTION_ID,
      OPEN_OPTION_ID,
      ARCHIVED_OPTION_ID,
    ]);
  });

  it('marks options added to another application field as custom, whatever the input says', () => {
    const normalizedOptions = normalizeUpdatedFieldMetadataOptions({
      updatedOptions: [
        { ...openOption, isCustom: true },
        closedOption,
        { ...archivedCustomOption, isCustom: false },
        { value: 'LOST', label: 'Lost', color: 'red', position: 3 },
      ],
      existingOptions,
      isFieldOwnedByAnotherApplication: true,
    });

    expect(normalizedOptions.map(({ isCustom }) => isCustom)).toEqual([
      undefined,
      undefined,
      true,
      true,
    ]);
  });

  it('only stores isActive when an option is inactive', () => {
    const normalizedOptions = normalizeUpdatedFieldMetadataOptions({
      updatedOptions: [
        { ...openOption, isActive: true },
        { ...closedOption, isActive: false },
        archivedCustomOption,
      ],
      existingOptions,
      isFieldOwnedByAnotherApplication: true,
    });

    expect(normalizedOptions.map((option) => 'isActive' in option)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('lets a workspace remove the option it added', () => {
    expect(
      normalizeUpdatedFieldMetadataOptions({
        updatedOptions: [openOption, closedOption],
        existingOptions,
        isFieldOwnedByAnotherApplication: true,
      }),
    ).toEqual([openOption, closedOption]);
  });

  it('rejects removing or re-valuing an option of the field application', () => {
    expect(() =>
      normalizeUpdatedFieldMetadataOptions({
        updatedOptions: [openOption, archivedCustomOption],
        existingOptions,
        isFieldOwnedByAnotherApplication: true,
      }),
    ).toThrow(FieldMetadataException);

    expect(() =>
      normalizeUpdatedFieldMetadataOptions({
        updatedOptions: [
          openOption,
          { ...closedOption, value: 'DONE' },
          archivedCustomOption,
        ],
        existingOptions,
        isFieldOwnedByAnotherApplication: true,
      }),
    ).toThrow(FieldMetadataException);
  });

  it('lets the owner of the field remove and re-value any option', () => {
    expect(
      normalizeUpdatedFieldMetadataOptions({
        updatedOptions: [{ ...closedOption, value: 'DONE' }],
        existingOptions: [openOption, closedOption],
        isFieldOwnedByAnotherApplication: false,
      }),
    ).toEqual([{ ...closedOption, value: 'DONE' }]);
  });
});
