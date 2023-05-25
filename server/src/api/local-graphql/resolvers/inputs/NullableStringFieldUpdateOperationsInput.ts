import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.InputType('NullableStringFieldUpdateOperationsInput', {
  isAbstract: true,
})
export class NullableStringFieldUpdateOperationsInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  set?: string | undefined;
}
