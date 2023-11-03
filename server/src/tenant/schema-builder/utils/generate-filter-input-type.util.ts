import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';
import { UUIDFilterType } from 'src/tenant/schema-builder/graphql-types/input/uuid-filter.type';
import { DatetimeFilterType } from 'src/tenant/schema-builder/graphql-types/input/date-time-filter.type';

import { mapColumnTypeToFilterType } from './map-column-type-to-filter-type.util';

const defaultFields = {
  id: { type: UUIDFilterType },
  createdAt: { type: DatetimeFilterType },
  updatedAt: { type: DatetimeFilterType },
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
  const filterInputType = new GraphQLInputObjectType({
    name: `${pascalCase(name)}FilterInput`,
    fields: () => ({
      ...defaultFields,
      ...columns.reduce((fields, column) => {
        const graphqlType = mapColumnTypeToFilterType(column);

        fields[column.name] = {
          type: graphqlType,
        };

        return fields;
      }, {}),
      and: {
        type: new GraphQLList(new GraphQLNonNull(filterInputType)),
      },
      or: {
        type: new GraphQLList(new GraphQLNonNull(filterInputType)),
      },
      not: {
        type: filterInputType,
      },
    }),
  });

  return filterInputType;
};
