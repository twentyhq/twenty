import { GraphQLBoolean } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { UUIDFilterType } from 'src/tenant/schema-builder/graphql-types/input/uuid-filter.type';
import { StringFilterType } from 'src/tenant/schema-builder/graphql-types/input/string-filter.type';
import { DateFilterType } from 'src/tenant/schema-builder/graphql-types/input/date-filter.type';
import { IntFilter } from 'src/tenant/schema-builder/graphql-types/input/int-filter.type';
import { UrlFilterType } from 'src/tenant/schema-builder/graphql-types/input/url-filter.type';
import { MoneyFilterType } from 'src/tenant/schema-builder/graphql-types/input/money-filter.type';

/**
 * Map the column type from field-metadata to its corresponding filter type.
 * @param columnType Type of the column in the database.
 */
export const mapColumnTypeToFilterType = (column: FieldMetadata) => {
  switch (column.type) {
    case 'uuid':
      return UUIDFilterType;
    case 'text':
    case 'phone':
    case 'email':
      return StringFilterType;
    case 'date':
      return DateFilterType;
    case 'boolean':
      return GraphQLBoolean;
    case 'number':
      return IntFilter;
    case 'url': {
      return UrlFilterType;
    }
    case 'money': {
      return MoneyFilterType;
    }
    case 'enum':
    default:
      throw new Error(`${column.type} filter type not yet implemented`);
  }
};
