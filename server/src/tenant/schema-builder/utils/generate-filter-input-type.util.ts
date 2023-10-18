import { GraphQLInputObjectType } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';
import { UUIDFilterType } from 'src/tenant/schema-builder/graphql-types/input/uuid-filter.type';
import { StringFilterType } from 'src/tenant/schema-builder/graphql-types/input/string-filter.type';

import { mapColumnTypeToFilterType } from './map-column-type-to-filter-type.util';

const defaultFields = {
  id: { type: UUIDFilterType },
  createdAt: { type: StringFilterType },
  updatedAt: { type: StringFilterType },
};

/**
 * Generate a GraphQL filter input type with filters based on the columns from metadata.
 * @param name Name for the GraphQL object.
 * @param columns Array of FieldMetadata columns.
 * @returns GraphQLInputObjectType
 */
export const generateFilterInputType = (
  name: string,
  columns: FieldMetadata[],
): GraphQLInputObjectType => {
  const fields = {
    ...defaultFields,
  };

  columns.forEach((column) => {
    const graphqlType = mapColumnTypeToFilterType(column);

    fields[column.name] = {
      type: graphqlType,
    };
  });

  return new GraphQLInputObjectType({
    name: `${pascalCase(name)}FilterInput`,
    fields,
  });
};
