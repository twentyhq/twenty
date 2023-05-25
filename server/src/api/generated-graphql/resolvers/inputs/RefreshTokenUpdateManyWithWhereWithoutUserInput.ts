import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenScalarWhereInput } from './RefreshTokenScalarWhereInput';
import { RefreshTokenUpdateManyMutationInput } from './RefreshTokenUpdateManyMutationInput';

@TypeGraphQL.InputType('RefreshTokenUpdateManyWithWhereWithoutUserInput', {
  isAbstract: true,
})
export class RefreshTokenUpdateManyWithWhereWithoutUserInput {
  @TypeGraphQL.Field((_type) => RefreshTokenScalarWhereInput, {
    nullable: false,
  })
  where!: RefreshTokenScalarWhereInput;

  @TypeGraphQL.Field((_type) => RefreshTokenUpdateManyMutationInput, {
    nullable: false,
  })
  data!: RefreshTokenUpdateManyMutationInput;
}
