import { AggregateOperations } from '@/types/AggregateOperations';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { computeRollupResultType } from '@/utils/rollup/computeRollupResultType';

describe('computeRollupResultType', () => {
  it('should count related records as a number', () => {
    expect(
      computeRollupResultType({
        aggregateOperation: AggregateOperations.COUNT,
        aggregatedFieldValueType: null,
      }),
    ).toBe(FieldMetadataType.NUMBER);
  });

  it('should refuse a count on a field', () => {
    expect(
      computeRollupResultType({
        aggregateOperation: AggregateOperations.COUNT,
        aggregatedFieldValueType: FieldMetadataType.NUMBER,
      }),
    ).toBeNull();
  });

  it.each([
    AggregateOperations.SUM,
    AggregateOperations.AVG,
    AggregateOperations.MIN,
    AggregateOperations.MAX,
  ] as const)('should compute %s of a number as a number', (operation) => {
    expect(
      computeRollupResultType({
        aggregateOperation: operation,
        aggregatedFieldValueType: FieldMetadataType.NUMBER,
      }),
    ).toBe(FieldMetadataType.NUMBER);
  });

  it.each([
    [AggregateOperations.MIN, FieldMetadataType.DATE],
    [AggregateOperations.MAX, FieldMetadataType.DATE],
    [AggregateOperations.MIN, FieldMetadataType.DATE_TIME],
    [AggregateOperations.MAX, FieldMetadataType.DATE_TIME],
  ] as const)('should keep the date type for %s of %s', (operation, type) => {
    expect(
      computeRollupResultType({
        aggregateOperation: operation,
        aggregatedFieldValueType: type,
      }),
    ).toBe(type);
  });

  it.each([
    [AggregateOperations.SUM, FieldMetadataType.DATE],
    [AggregateOperations.AVG, FieldMetadataType.DATE_TIME],
    [AggregateOperations.SUM, FieldMetadataType.TEXT],
    [AggregateOperations.MAX, FieldMetadataType.CURRENCY],
    [AggregateOperations.SUM, null],
  ] as const)('should refuse %s of %s', (operation, type) => {
    expect(
      computeRollupResultType({
        aggregateOperation: operation,
        aggregatedFieldValueType: type,
      }),
    ).toBeNull();
  });
});
