import { GraphQLBoolean } from 'graphql';

import {
  FieldMetadata,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
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
    case FieldMetadataType.UUID:
      return UUIDFilterType;
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
      return StringFilterType;
    case FieldMetadataType.DATE:
      return DateFilterType;
    case FieldMetadataType.BOOLEAN:
      return GraphQLBoolean;
    case FieldMetadataType.NUMBER:
      return IntFilter;
    case FieldMetadataType.URL: {
      return UrlFilterType;
    }
    case FieldMetadataType.MONEY: {
      return MoneyFilterType;
    }
    case FieldMetadataType.ENUM:
    default:
      throw new Error(`${column.type} filter type not yet implemented`);
  }
};
