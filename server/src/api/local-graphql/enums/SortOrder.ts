import * as TypeGraphQL from '@nestjs/graphql';

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}
TypeGraphQL.registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: undefined,
});
