import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

import { mapColumnTypeToGraphQLType } from './map-column-type-to-graphql-type.util';

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
    const graphqlType = mapColumnTypeToGraphQLType(column, true);

    fields[column.displayName] = {
      type: !column.isNullable ? new GraphQLNonNull(graphqlType) : graphqlType,
      description: column.targetColumnName,
    };
  });

  return new GraphQLInputObjectType({
    name: `${pascalCase(name)}CreateInput`,
    fields,
  });
};
