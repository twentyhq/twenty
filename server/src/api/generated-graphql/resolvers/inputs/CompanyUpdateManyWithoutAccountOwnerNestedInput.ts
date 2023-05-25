import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateManyAccountOwnerInputEnvelope } from './CompanyCreateManyAccountOwnerInputEnvelope';
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from './CompanyCreateOrConnectWithoutAccountOwnerInput';
import { CompanyCreateWithoutAccountOwnerInput } from './CompanyCreateWithoutAccountOwnerInput';
import { CompanyScalarWhereInput } from './CompanyScalarWhereInput';
import { CompanyUpdateManyWithWhereWithoutAccountOwnerInput } from './CompanyUpdateManyWithWhereWithoutAccountOwnerInput';
import { CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput } from './CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput';
import { CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput } from './CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput';
import { CompanyWhereUniqueInput } from './CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyUpdateManyWithoutAccountOwnerNestedInput', {
  isAbstract: true,
})
export class CompanyUpdateManyWithoutAccountOwnerNestedInput {
  @TypeGraphQL.Field((_type) => [CompanyCreateWithoutAccountOwnerInput], {
    nullable: true,
  })
  create?: CompanyCreateWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [CompanyCreateOrConnectWithoutAccountOwnerInput],
    {
      nullable: true,
    },
  )
  connectOrCreate?:
    | CompanyCreateOrConnectWithoutAccountOwnerInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput],
    {
      nullable: true,
    },
  )
  upsert?: CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field((_type) => CompanyCreateManyAccountOwnerInputEnvelope, {
    nullable: true,
  })
  createMany?: CompanyCreateManyAccountOwnerInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [CompanyWhereUniqueInput], {
    nullable: true,
  })
  set?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyWhereUniqueInput], {
    nullable: true,
  })
  delete?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyWhereUniqueInput], {
    nullable: true,
  })
  connect?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput],
    {
      nullable: true,
    },
  )
  update?: CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [CompanyUpdateManyWithWhereWithoutAccountOwnerInput],
    {
      nullable: true,
    },
  )
  updateMany?: CompanyUpdateManyWithWhereWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: CompanyScalarWhereInput[] | undefined;
}
