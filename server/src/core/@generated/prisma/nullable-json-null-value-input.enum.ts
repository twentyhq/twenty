import { registerEnumType } from '@nestjs/graphql';

export enum NullableJsonNullValueInput {
  DbNull = 'DbNull',
  JsonNull = 'JsonNull',
}

registerEnumType(NullableJsonNullValueInput, {
  name: 'NullableJsonNullValueInput',
  description: undefined,
});
