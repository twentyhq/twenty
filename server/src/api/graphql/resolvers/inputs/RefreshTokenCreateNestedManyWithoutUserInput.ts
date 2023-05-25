import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenCreateManyUserInputEnvelope } from '../inputs/RefreshTokenCreateManyUserInputEnvelope';
import { RefreshTokenCreateOrConnectWithoutUserInput } from '../inputs/RefreshTokenCreateOrConnectWithoutUserInput';
import { RefreshTokenCreateWithoutUserInput } from '../inputs/RefreshTokenCreateWithoutUserInput';
import { RefreshTokenWhereUniqueInput } from '../inputs/RefreshTokenWhereUniqueInput';

@TypeGraphQL.InputType('RefreshTokenCreateNestedManyWithoutUserInput', {
  isAbstract: true,
})
export class RefreshTokenCreateNestedManyWithoutUserInput {
  @TypeGraphQL.Field((_type) => [RefreshTokenCreateWithoutUserInput], {
    nullable: true,
  })
  create?: RefreshTokenCreateWithoutUserInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenCreateOrConnectWithoutUserInput], {
    nullable: true,
  })
  connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput[] | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenCreateManyUserInputEnvelope, {
    nullable: true,
  })
  createMany?: RefreshTokenCreateManyUserInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenWhereUniqueInput], {
    nullable: true,
  })
  connect?: RefreshTokenWhereUniqueInput[] | undefined;
}
