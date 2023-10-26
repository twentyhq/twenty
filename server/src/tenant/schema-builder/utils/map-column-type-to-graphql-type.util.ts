import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  FieldMetadata,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

const UrlObjectType = new GraphQLObjectType({
  name: 'Url',
  fields: {
    text: { type: GraphQLString },
    link: { type: GraphQLString },
  },
});

const UrlInputType = new GraphQLInputObjectType({
  name: 'UrlInput',
  fields: {
    text: { type: GraphQLString },
    link: { type: GraphQLString },
  },
});

const MoneyObjectType = new GraphQLObjectType({
  name: 'Money',
  fields: {
    amount: { type: GraphQLInt },
    currency: { type: GraphQLString },
  },
});

const MoneyInputType = new GraphQLInputObjectType({
  name: 'MoneyInput',
  fields: {
    amount: { type: GraphQLInt },
    currency: { type: GraphQLString },
  },
});

/**
 * Map the column type from field-metadata to its corresponding GraphQL type.
 * @param columnType Type of the column in the database.
 */
export const mapColumnTypeToGraphQLType = (
  column: FieldMetadata,
  input = false,
) => {
  switch (column.type) {
    case FieldMetadataType.UUID:
      return GraphQLID;
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
    case FieldMetadataType.DATE:
      return GraphQLString;
    case FieldMetadataType.BOOLEAN:
      return GraphQLBoolean;
    case FieldMetadataType.NUMBER:
      return GraphQLInt;
    case FieldMetadataType.ENUM: {
      if (column.enums && column.enums.length > 0) {
        const enumName = `${pascalCase(column.name)}Enum`;

        return new GraphQLEnumType({
          name: enumName,
          values: Object.fromEntries(
            column.enums.map((value) => [value, { value }]),
          ),
        });
      }
    }
    case FieldMetadataType.URL: {
      return input ? UrlInputType : UrlObjectType;
    }
    case FieldMetadataType.MONEY: {
      return input ? MoneyInputType : MoneyObjectType;
    }
    default:
      return GraphQLString;
  }
};
