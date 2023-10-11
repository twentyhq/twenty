import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

/**
 * Map the column type from field-metadata to its corresponding GraphQL type.
 * @param columnType Type of the column in the database.
 */
export const mapColumnTypeToGraphQLType = (column: FieldMetadata) => {
  switch (column.type) {
    case 'uuid':
      return GraphQLID;
    case 'text':
    case 'url':
    case 'date':
      return GraphQLString;
    case 'boolean':
      return GraphQLBoolean;
    case 'number':
      return GraphQLInt;
    case 'enum': {
      if (column.enums && column.enums.length > 0) {
        const enumName = `${pascalCase(column.objectId)}${pascalCase(
          column.displayName,
        )}Enum`;

        return new GraphQLEnumType({
          name: enumName,
          values: Object.fromEntries(
            column.enums.map((value) => [value, { value }]),
          ),
        });
      }
    }
    default:
      return GraphQLString;
  }
};
