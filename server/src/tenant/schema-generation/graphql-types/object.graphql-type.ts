import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

/**
 * Map the column type from field-metadata to its corresponding GraphQL type.
 * @param columnType Type of the column in the database.
 */
const mapColumnTypeToGraphQLType = (column: FieldMetadata): any => {
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

/**
 * Generate a GraphQL object type based on the name and columns.
 * @param name Name for the GraphQL object.
 * @param columns Array of FieldMetadata columns.
 * @returns GraphQLObjectType
 */
export const generateObjectType = <TSource = any, TContext = any>(
  name: string,
  columns: FieldMetadata[],
): GraphQLObjectType<TSource, TContext> => {
  const fields: Record<string, any> = {
    // Default fields
    id: { type: new GraphQLNonNull(GraphQLID) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) },
  };

  columns.forEach((column) => {
    let graphqlType = mapColumnTypeToGraphQLType(column);

    if (!column.isNullable) {
      graphqlType = new GraphQLNonNull(graphqlType);
    }

    fields[column.displayName] = {
      type: graphqlType,
      description: column.targetColumnName,
    };
  });

  return new GraphQLObjectType({
    name: pascalCase(name),
    fields,
  });
};

/**
 * Generate a GraphQL create input type based on the name and columns.
 * @param name Name for the GraphQL input.
 * @param columns Array of FieldMetadata columns.
 * @returns GraphQLInputObjectType
 */
export const generateCreateInputType = (
  name: string,
  columns: FieldMetadata[],
): GraphQLInputObjectType => {
  const fields: Record<string, any> = {};

  columns.forEach((column) => {
    let graphqlType = mapColumnTypeToGraphQLType(column);

    if (!column.isNullable) {
      graphqlType = new GraphQLNonNull(graphqlType);
    }

    fields[column.displayName] = {
      type: graphqlType,
      description: column.targetColumnName,
    };
  });

  return new GraphQLInputObjectType({
    name: `${pascalCase(name)}CreateInput`,
    fields,
  });
};

/**
 * Generate a GraphQL update input type based on the name and columns.
 * @param name Name for the GraphQL input.
 * @param columns Array of FieldMetadata columns.
 * @returns GraphQLInputObjectType
 */
export const generateUpdateInputType = (
  name: string,
  columns: FieldMetadata[],
): GraphQLInputObjectType => {
  const fields: Record<string, any> = {};

  columns.forEach((column) => {
    const graphqlType = mapColumnTypeToGraphQLType(column);
    // No GraphQLNonNull wrapping here, so all fields are optional
    fields[column.displayName] = {
      type: graphqlType,
      description: column.targetColumnName,
    };
  });

  return new GraphQLInputObjectType({
    name: `${pascalCase(name)}UpdateInput`,
    fields,
  });
};

/**
 * Generate multiple GraphQL object types based on an array of object metadata.
 * @param objectMetadata Array of ObjectMetadata.
 */
export const generateObjectTypes = (objectMetadata: ObjectMetadata[]) => {
  const objectTypes: Record<string, GraphQLObjectType> = {};

  for (const object of objectMetadata) {
    const ObjectType = generateObjectType(object.displayName, object.fields);

    objectTypes[object.displayName] = ObjectType;
  }

  return objectTypes;
};
