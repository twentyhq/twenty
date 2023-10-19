import { GraphQLInputObjectType } from 'graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';
import { OrderByDirectionType } from 'src/tenant/schema-builder/graphql-types/enum/order-by-direction.type';

const defaultFields = {
  id: { type: OrderByDirectionType },
  createdAt: { type: OrderByDirectionType },
  updatedAt: { type: OrderByDirectionType },
};

/**
 * Generate a GraphQL order by input type with order by fields based on the columns from metadata.
 * @param name Name for the GraphQL object.
 * @param columns Array of FieldMetadata columns.
 * @returns GraphQLInputObjectType
 */
export const generateOrderByInputType = (
  name: string,
  columns: FieldMetadata[],
): GraphQLInputObjectType => {
  const fields = {
    ...defaultFields,
  };

  columns.forEach((column) => {
    fields[column.name] = {
      type: OrderByDirectionType,
    };
  });

  return new GraphQLInputObjectType({
    name: `${pascalCase(name)}OrderBy`,
    fields,
  });
};
