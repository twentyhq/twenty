import { GraphQLBoolean } from 'graphql';

import { mapColumnTypeToFilterType } from 'src/tenant/schema-builder/utils/map-column-type-to-filter-type.util'; // Update with the actual path
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { UUIDFilterType } from 'src/tenant/schema-builder/graphql-types/input/uuid-filter.type';
import { StringFilterType } from 'src/tenant/schema-builder/graphql-types/input/string-filter.type';
import { DateFilterType } from 'src/tenant/schema-builder/graphql-types/input/date-filter.type';
import { IntFilter } from 'src/tenant/schema-builder/graphql-types/input/int-filter.type';
import { UrlFilterType } from 'src/tenant/schema-builder/graphql-types/input/url-filter.type';
import { MoneyFilterType } from 'src/tenant/schema-builder/graphql-types/input/money-filter.type';

describe('mapColumnTypeToFilterType', () => {
  it('should map column types to corresponding filter types', () => {
    const fields: { column: FieldMetadata; expected: any }[] = [
      { column: { type: 'uuid' } as FieldMetadata, expected: UUIDFilterType },
      { column: { type: 'text' } as FieldMetadata, expected: StringFilterType },
      {
        column: { type: 'phone' } as FieldMetadata,
        expected: StringFilterType,
      },
      {
        column: { type: 'email' } as FieldMetadata,
        expected: StringFilterType,
      },
      { column: { type: 'date' } as FieldMetadata, expected: DateFilterType },
      {
        column: { type: 'boolean' } as FieldMetadata,
        expected: GraphQLBoolean,
      },
      { column: { type: 'number' } as FieldMetadata, expected: IntFilter },
      { column: { type: 'url' } as FieldMetadata, expected: UrlFilterType },
      { column: { type: 'money' } as FieldMetadata, expected: MoneyFilterType },
    ];

    fields.forEach((field) => {
      expect(mapColumnTypeToFilterType(field.column)).toBe(field.expected);
    });
  });

  it('should throw an error for unimplemented filter types', () => {
    const column = { type: 'enum' } as FieldMetadata;

    expect(() => mapColumnTypeToFilterType(column)).toThrowError(
      'enum filter type not yet implemented',
    );
  });
});
