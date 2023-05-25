import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenCreateManyUserInputEnvelope } from './RefreshTokenCreateManyUserInputEnvelope';
import { RefreshTokenCreateOrConnectWithoutUserInput } from './RefreshTokenCreateOrConnectWithoutUserInput';
import { RefreshTokenCreateWithoutUserInput } from './RefreshTokenCreateWithoutUserInput';
import { RefreshTokenScalarWhereInput } from './RefreshTokenScalarWhereInput';
import { RefreshTokenUpdateManyWithWhereWithoutUserInput } from './RefreshTokenUpdateManyWithWhereWithoutUserInput';
import { RefreshTokenUpdateWithWhereUniqueWithoutUserInput } from './RefreshTokenUpdateWithWhereUniqueWithoutUserInput';
import { RefreshTokenUpsertWithWhereUniqueWithoutUserInput } from './RefreshTokenUpsertWithWhereUniqueWithoutUserInput';
import { RefreshTokenWhereUniqueInput } from './RefreshTokenWhereUniqueInput';

@TypeGraphQL.InputType('RefreshTokenUpdateManyWithoutUserNestedInput', {
  isAbstract: true,
})
export class RefreshTokenUpdateManyWithoutUserNestedInput {
  @TypeGraphQL.Field((_type) => [RefreshTokenCreateWithoutUserInput], {
    nullable: true,
  })
  create?: RefreshTokenCreateWithoutUserInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenCreateOrConnectWithoutUserInput], {
    nullable: true,
  })
  connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [RefreshTokenUpsertWithWhereUniqueWithoutUserInput],
    {
      nullable: true,
    },
  )
  upsert?: RefreshTokenUpsertWithWhereUniqueWithoutUserInput[] | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenCreateManyUserInputEnvelope, {
    nullable: true,
  })
  createMany?: RefreshTokenCreateManyUserInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenWhereUniqueInput], {
    nullable: true,
  })
  set?: RefreshTokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: RefreshTokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenWhereUniqueInput], {
    nullable: true,
  })
  delete?: RefreshTokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenWhereUniqueInput], {
    nullable: true,
  })
  connect?: RefreshTokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [RefreshTokenUpdateWithWhereUniqueWithoutUserInput],
    {
      nullable: true,
    },
  )
  update?: RefreshTokenUpdateWithWhereUniqueWithoutUserInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [RefreshTokenUpdateManyWithWhereWithoutUserInput],
    {
      nullable: true,
    },
  )
  updateMany?: RefreshTokenUpdateManyWithWhereWithoutUserInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: RefreshTokenScalarWhereInput[] | undefined;
}
