import * as TypeGraphQL from '@nestjs/graphql';

export enum NullableJsonNullValueInput {
  DbNull = 'DbNull',
  JsonNull = 'JsonNull',
}
TypeGraphQL.registerEnumType(NullableJsonNullValueInput, {
  name: 'NullableJsonNullValueInput',
  description: undefined,
});
