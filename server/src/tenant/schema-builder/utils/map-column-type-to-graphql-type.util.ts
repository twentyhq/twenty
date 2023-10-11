import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
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
    case 'uuid':
      return GraphQLID;
    case 'text':
    case 'phone':
    case 'email':
    case 'date':
      return GraphQLString;
    case 'boolean':
      return GraphQLBoolean;
    case 'number':
      return GraphQLInt;
    case 'enum': {
      if (column.enums && column.enums.length > 0) {
        const enumName = `${pascalCase(column.displayName)}Enum`;

        return new GraphQLEnumType({
          name: enumName,
          values: Object.fromEntries(
            column.enums.map((value) => [value, { value }]),
          ),
        });
      }
    }
    case 'url': {
      return input ? UrlInputType : UrlObjectType;
    }
    case 'money': {
      return input ? MoneyInputType : MoneyObjectType;
    }
    default:
      return GraphQLString;
  }
};
