import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { OrderByDirectionType } from 'src/tenant/schema-builder/graphql-types/enum/order-by-direction.type';
import { generateOrderByInputType } from 'src/tenant/schema-builder/utils/generate-order-by-input-type.util';

describe('generateOrderByInputType', () => {
  it('includes default fields', () => {
    const result = generateOrderByInputType('SampleType', []);
    const fields = result.getFields();

    expect(fields.id.type).toBe(OrderByDirectionType);
    expect(fields.createdAt.type).toBe(OrderByDirectionType);
    expect(fields.updatedAt.type).toBe(OrderByDirectionType);
  });

  it('adds fields from provided FieldMetadata columns', () => {
    const testColumns = [
      { name: 'customField1' },
      { name: 'customField2' },
    ] as FieldMetadata[];
    const result = generateOrderByInputType('SampleType', testColumns);
    const fields = result.getFields();

    expect(fields.customField1.type).toBe(OrderByDirectionType);
    expect(fields.customField2.type).toBe(OrderByDirectionType);
  });
});
