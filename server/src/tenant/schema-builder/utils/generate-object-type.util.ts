import { GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';
import { DateTimeScalarType } from 'src/tenant/schema-builder/graphql-types/scalars/date-time.scalar';

import { mapColumnTypeToGraphQLType } from './map-column-type-to-graphql-type.util';

const defaultFields = {
  id: { type: new GraphQLNonNull(GraphQLID) },
  createdAt: { type: new GraphQLNonNull(DateTimeScalarType) },
  updatedAt: { type: new GraphQLNonNull(DateTimeScalarType) },
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
  const fields = {
    ...defaultFields,
  };

  columns.forEach((column) => {
    const graphqlType = mapColumnTypeToGraphQLType(column);

    fields[column.name] = {
      type: !column.isNullable ? new GraphQLNonNull(graphqlType) : graphqlType,
    };
  });

  return new GraphQLObjectType({
    name: pascalCase(name),
    fields,
  });
};
