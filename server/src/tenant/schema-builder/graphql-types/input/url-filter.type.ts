import { GraphQLInputObjectType } from 'graphql';

import { StringFilterType } from 'src/tenant/schema-builder/graphql-types/input/string-filter.type';

export const UrlFilterType = new GraphQLInputObjectType({
  name: 'UrlFilter',
  fields: {
    text: { type: StringFilterType },
    link: { type: StringFilterType },
  },
});
