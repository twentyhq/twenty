import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenCreateWithoutUserInput } from './RefreshTokenCreateWithoutUserInput';
import { RefreshTokenUpdateWithoutUserInput } from './RefreshTokenUpdateWithoutUserInput';
import { RefreshTokenWhereUniqueInput } from './RefreshTokenWhereUniqueInput';

@TypeGraphQL.InputType('RefreshTokenUpsertWithWhereUniqueWithoutUserInput', {
  isAbstract: true,
})
export class RefreshTokenUpsertWithWhereUniqueWithoutUserInput {
  @TypeGraphQL.Field((_type) => RefreshTokenWhereUniqueInput, {
    nullable: false,
  })
  where!: RefreshTokenWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RefreshTokenUpdateWithoutUserInput, {
    nullable: false,
  })
  update!: RefreshTokenUpdateWithoutUserInput;

  @TypeGraphQL.Field((_type) => RefreshTokenCreateWithoutUserInput, {
    nullable: false,
  })
  create!: RefreshTokenCreateWithoutUserInput;
}
