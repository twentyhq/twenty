import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getInvalidSelectFilterOptionValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';

const OBJECT_ID = '11111111-1111-4111-8111-111111111111';

const selectField = getFlatFieldMetadataMock({
  id: '33333333-3333-4333-8333-333333333333',
  universalIdentifier: '33333333-3333-4333-8333-333333333333',
  objectMetadataId: OBJECT_ID,
  type: FieldMetadataType.SELECT,
  name: 'stage',
  label: 'Stage',
  options: [
    { id: 'opt-won', color: 'green', label: 'Won', value: 'WON', position: 0 },
    { id: 'opt-lost', color: 'red', label: 'Lost', value: 'LOST', position: 1 },
  ],
}) as FlatFieldMetadata<FieldMetadataType.SELECT>;

describe('getInvalidSelectFilterOptionValues', () => {
  it('returns invalid values for a SELECT field when an option does not exist', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS,
        value: ['WON', 'NOT_A_REAL_OPTION'],
      }),
    ).toEqual(['NOT_A_REAL_OPTION']);
  });

  it('returns an empty array when all SELECT values are valid options', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS,
        value: ['WON', 'LOST'],
      }),
    ).toEqual([]);
  });

  it('supports a plain string array value', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS,
        value: ['NOPE'],
      }),
    ).toEqual(['NOPE']);
  });

  it('parses a JSON-stringified array value (chart filter format)', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS,
        value: '["WON"]',
      }),
    ).toEqual([]);
  });

  it('parses a JSON-stringified multi-value array and reports invalid options', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS,
        value: '["WON","NOPE"]',
      }),
    ).toEqual(['NOPE']);
  });

  it('treats a non-JSON plain string as a single option value', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS,
        value: 'WON',
      }),
    ).toEqual([]);
  });

  it('ignores value-less operands like IS_EMPTY', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS_EMPTY,
        value: '',
      }),
    ).toEqual([]);
  });

  it('ignores subfield filters', () => {
    expect(
      getInvalidSelectFilterOptionValues({
        fieldMetadata: selectField,
        operand: ViewFilterOperand.IS,
        subFieldName: 'someSubField',
        value: JSON.stringify(['NOPE']),
      }),
    ).toEqual([]);
  });
});
