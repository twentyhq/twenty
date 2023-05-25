import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenUpdateWithoutUserInput } from './RefreshTokenUpdateWithoutUserInput';
import { RefreshTokenWhereUniqueInput } from './RefreshTokenWhereUniqueInput';

@TypeGraphQL.InputType('RefreshTokenUpdateWithWhereUniqueWithoutUserInput', {
  isAbstract: true,
})
export class RefreshTokenUpdateWithWhereUniqueWithoutUserInput {
  @TypeGraphQL.Field((_type) => RefreshTokenWhereUniqueInput, {
    nullable: false,
  })
  where!: RefreshTokenWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RefreshTokenUpdateWithoutUserInput, {
    nullable: false,
  })
  data!: RefreshTokenUpdateWithoutUserInput;
}
