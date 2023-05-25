import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenCreateWithoutUserInput } from '../inputs/RefreshTokenCreateWithoutUserInput';
import { RefreshTokenWhereUniqueInput } from '../inputs/RefreshTokenWhereUniqueInput';

@TypeGraphQL.InputType('RefreshTokenCreateOrConnectWithoutUserInput', {
  isAbstract: true,
})
export class RefreshTokenCreateOrConnectWithoutUserInput {
  @TypeGraphQL.Field((_type) => RefreshTokenWhereUniqueInput, {
    nullable: false,
  })
  where!: RefreshTokenWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RefreshTokenCreateWithoutUserInput, {
    nullable: false,
  })
  create!: RefreshTokenCreateWithoutUserInput;
}
