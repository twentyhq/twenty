import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateManyWorkspaceInputEnvelope } from './CompanyCreateManyWorkspaceInputEnvelope';
import { CompanyCreateOrConnectWithoutWorkspaceInput } from './CompanyCreateOrConnectWithoutWorkspaceInput';
import { CompanyCreateWithoutWorkspaceInput } from './CompanyCreateWithoutWorkspaceInput';
import { CompanyScalarWhereInput } from './CompanyScalarWhereInput';
import { CompanyUpdateManyWithWhereWithoutWorkspaceInput } from './CompanyUpdateManyWithWhereWithoutWorkspaceInput';
import { CompanyUpdateWithWhereUniqueWithoutWorkspaceInput } from './CompanyUpdateWithWhereUniqueWithoutWorkspaceInput';
import { CompanyUpsertWithWhereUniqueWithoutWorkspaceInput } from './CompanyUpsertWithWhereUniqueWithoutWorkspaceInput';
import { CompanyWhereUniqueInput } from './CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyUpdateManyWithoutWorkspaceNestedInput', {
  isAbstract: true,
})
export class CompanyUpdateManyWithoutWorkspaceNestedInput {
  @TypeGraphQL.Field((_type) => [CompanyCreateWithoutWorkspaceInput], {
    nullable: true,
  })
  create?: CompanyCreateWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyCreateOrConnectWithoutWorkspaceInput], {
    nullable: true,
  })
  connectOrCreate?: CompanyCreateOrConnectWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [CompanyUpsertWithWhereUniqueWithoutWorkspaceInput],
    {
      nullable: true,
    },
  )
  upsert?: CompanyUpsertWithWhereUniqueWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field((_type) => CompanyCreateManyWorkspaceInputEnvelope, {
    nullable: true,
  })
  createMany?: CompanyCreateManyWorkspaceInputEnvelope | undefined;

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
    (_type) => [CompanyUpdateWithWhereUniqueWithoutWorkspaceInput],
    {
      nullable: true,
    },
  )
  update?: CompanyUpdateWithWhereUniqueWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [CompanyUpdateManyWithWhereWithoutWorkspaceInput],
    {
      nullable: true,
    },
  )
  updateMany?: CompanyUpdateManyWithWhereWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: CompanyScalarWhereInput[] | undefined;
}
