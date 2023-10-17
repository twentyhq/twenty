import { GraphQLInputObjectType } from 'graphql';

import { StringFilterType } from 'src/tenant/schema-builder/graphql-types/input/string-filter.type';
import { IntFilter } from 'src/tenant/schema-builder/graphql-types/input/int-filter.type';

export const MoneyFilterType = new GraphQLInputObjectType({
  name: 'MoneyFilter',
  fields: {
    amount: { type: IntFilter },
    currency: { type: StringFilterType },
  },
});
