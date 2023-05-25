import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateManyWorkspaceInputEnvelope } from '../inputs/CompanyCreateManyWorkspaceInputEnvelope';
import { CompanyCreateOrConnectWithoutWorkspaceInput } from '../inputs/CompanyCreateOrConnectWithoutWorkspaceInput';
import { CompanyCreateWithoutWorkspaceInput } from '../inputs/CompanyCreateWithoutWorkspaceInput';
import { CompanyScalarWhereInput } from '../inputs/CompanyScalarWhereInput';
import { CompanyUpdateManyWithWhereWithoutWorkspaceInput } from '../inputs/CompanyUpdateManyWithWhereWithoutWorkspaceInput';
import { CompanyUpdateWithWhereUniqueWithoutWorkspaceInput } from '../inputs/CompanyUpdateWithWhereUniqueWithoutWorkspaceInput';
import { CompanyUpsertWithWhereUniqueWithoutWorkspaceInput } from '../inputs/CompanyUpsertWithWhereUniqueWithoutWorkspaceInput';
import { CompanyWhereUniqueInput } from '../inputs/CompanyWhereUniqueInput';

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
