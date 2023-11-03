import { GraphQLList, GraphQLNonNull, GraphQLInputObjectType } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateFilterInputType } from 'src/tenant/schema-builder/utils/generate-filter-input-type.util';
import { mapColumnTypeToFilterType } from 'src/tenant/schema-builder/utils/map-column-type-to-filter-type.util';

describe('generateFilterInputType', () => {
  it('handles empty columns array', () => {
    const FilterInputType = generateFilterInputType('EmptyTest', []);

    expect(FilterInputType.name).toBe('EmptyTestFilterInput');

    expect(FilterInputType.getFields()).toHaveProperty('id');
    expect(FilterInputType.getFields()).toHaveProperty('createdAt');
    expect(FilterInputType.getFields()).toHaveProperty('updatedAt');
    expect(FilterInputType.getFields()).toHaveProperty('and');
    expect(FilterInputType.getFields()).toHaveProperty('or');
    expect(FilterInputType.getFields()).toHaveProperty('not');
  });

  it('handles various column types', () => {
    const columns = [
      { name: 'stringField', type: 'text' },
      { name: 'intField', type: 'number' },
      { name: 'booleanField', type: 'boolean' },
    ] as FieldMetadata[];

    const FilterInputType = generateFilterInputType('MultiTypeTest', columns);

    columns.forEach((column) => {
      const expectedType = mapColumnTypeToFilterType(column);

      expect(FilterInputType.getFields()[column.name].type).toBe(expectedType);
    });
  });

  it('handles nested logical fields', () => {
    const FilterInputType = generateFilterInputType('NestedTest', []);

    const andFieldType = FilterInputType.getFields().and.type;
    const orFieldType = FilterInputType.getFields().or.type;
    const notFieldType = FilterInputType.getFields().not.type;

    expect(andFieldType).toBeInstanceOf(GraphQLList);
    expect(orFieldType).toBeInstanceOf(GraphQLList);

    if (notFieldType instanceof GraphQLNonNull) {
      expect(notFieldType.ofType).toBe(FilterInputType);
    } else {
      expect(notFieldType).toBeInstanceOf(GraphQLInputObjectType);
    }
  });
});
