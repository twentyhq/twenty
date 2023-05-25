import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenCreateManyUserInputEnvelope } from '../inputs/RefreshTokenCreateManyUserInputEnvelope';
import { RefreshTokenCreateOrConnectWithoutUserInput } from '../inputs/RefreshTokenCreateOrConnectWithoutUserInput';
import { RefreshTokenCreateWithoutUserInput } from '../inputs/RefreshTokenCreateWithoutUserInput';
import { RefreshTokenScalarWhereInput } from '../inputs/RefreshTokenScalarWhereInput';
import { RefreshTokenUpdateManyWithWhereWithoutUserInput } from '../inputs/RefreshTokenUpdateManyWithWhereWithoutUserInput';
import { RefreshTokenUpdateWithWhereUniqueWithoutUserInput } from '../inputs/RefreshTokenUpdateWithWhereUniqueWithoutUserInput';
import { RefreshTokenUpsertWithWhereUniqueWithoutUserInput } from '../inputs/RefreshTokenUpsertWithWhereUniqueWithoutUserInput';
import { RefreshTokenWhereUniqueInput } from '../inputs/RefreshTokenWhereUniqueInput';

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
