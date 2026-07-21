import { FieldMetadataType } from 'twenty-shared/types';

import {
  computeMostlyEmptyFieldMetadataIds,
  type FieldMetadataForEmptinessCheck,
} from 'src/engine/metadata-modules/object-metadata/utils/compute-mostly-empty-field-metadata-ids.util';

const buildFieldMetadata = (
  overrides: Partial<FieldMetadataForEmptinessCheck> = {},
): FieldMetadataForEmptinessCheck => ({
  id: 'field-id',
  name: 'churnReason',
  type: FieldMetadataType.TEXT,
  isActive: true,
  isSystem: false,
  ...overrides,
});

describe('computeMostlyEmptyFieldMetadataIds', () => {
  it('should flag an active field when its column reaches the emptiness threshold', () => {
    const result = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [buildFieldMetadata()],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([['churnReason', 0.95]]),
    });

    expect(result).toEqual(['field-id']);
  });

  it('should not flag a field when its column is below the emptiness threshold', () => {
    const result = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [buildFieldMetadata()],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([['churnReason', 0.5]]),
    });

    expect(result).toEqual([]);
  });

  it('should not flag inactive or system fields', () => {
    const result = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [
        buildFieldMetadata({ id: 'inactive-field-id', isActive: false }),
        buildFieldMetadata({ id: 'system-field-id', isSystem: true }),
      ],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([['churnReason', 1]]),
    });

    expect(result).toEqual([]);
  });

  it('should not flag the label identifier field', () => {
    const result = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [buildFieldMetadata({ id: 'label-identifier-field-id' })],
      labelIdentifierFieldMetadataId: 'label-identifier-field-id',
      emptyFractionByColumnName: new Map([['churnReason', 1]]),
    });

    expect(result).toEqual([]);
  });

  it('should not flag a field when its column is missing from statistics', () => {
    const result = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [buildFieldMetadata()],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map(),
    });

    expect(result).toEqual([]);
  });

  it('should flag a composite field only when all of its columns are mostly empty', () => {
    const fullNameFieldMetadata = buildFieldMetadata({
      name: 'name',
      type: FieldMetadataType.FULL_NAME,
    });

    const resultWithOneFilledColumn = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [fullNameFieldMetadata],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([
        ['nameFirstName', 0.99],
        ['nameLastName', 0.5],
      ]),
    });

    const resultWithAllColumnsEmpty = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [fullNameFieldMetadata],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([
        ['nameFirstName', 0.99],
        ['nameLastName', 0.99],
      ]),
    });

    expect(resultWithOneFilledColumn).toEqual([]);
    expect(resultWithAllColumnsEmpty).toEqual(['field-id']);
  });

  it('should not flag a links field whose label or secondary links carry data', () => {
    const linksFieldMetadata = buildFieldMetadata({
      name: 'introVideo',
      type: FieldMetadataType.LINKS,
    });

    const resultWithFilledLabel = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [linksFieldMetadata],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([
        ['introVideoPrimaryLinkLabel', 0.4],
        ['introVideoPrimaryLinkUrl', 1],
        ['introVideoSecondaryLinks', 1],
      ]),
    });

    const resultWithAllColumnsEmpty = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [linksFieldMetadata],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([
        ['introVideoPrimaryLinkLabel', 1],
        ['introVideoPrimaryLinkUrl', 1],
        ['introVideoSecondaryLinks', 1],
      ]),
    });

    expect(resultWithFilledLabel).toEqual([]);
    expect(resultWithAllColumnsEmpty).toEqual(['field-id']);
  });

  it('should ignore the currency code column when evaluating a currency field', () => {
    const result = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [
        buildFieldMetadata({ name: 'arr', type: FieldMetadataType.CURRENCY }),
      ],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([
        ['arrAmountMicros', 0.99],
        ['arrCurrencyCode', 0],
      ]),
    });

    expect(result).toEqual(['field-id']);
  });

  it('should not flag field types without meaningful emptiness', () => {
    const result = computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: [
        buildFieldMetadata({
          id: 'relation-field-id',
          name: 'company',
          type: FieldMetadataType.RELATION,
        }),
        buildFieldMetadata({
          id: 'boolean-field-id',
          name: 'idealCustomerProfile',
          type: FieldMetadataType.BOOLEAN,
        }),
      ],
      labelIdentifierFieldMetadataId: null,
      emptyFractionByColumnName: new Map([
        ['company', 1],
        ['idealCustomerProfile', 1],
      ]),
    });

    expect(result).toEqual([]);
  });
});
