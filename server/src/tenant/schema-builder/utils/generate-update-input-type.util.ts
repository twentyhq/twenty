import { GraphQLInputObjectType } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

import { mapColumnTypeToGraphQLType } from './map-column-type-to-graphql-type.util';

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
