import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateManyWorkspaceInputEnvelope } from '../inputs/WorkspaceMemberCreateManyWorkspaceInputEnvelope';
import { WorkspaceMemberCreateOrConnectWithoutWorkspaceInput } from '../inputs/WorkspaceMemberCreateOrConnectWithoutWorkspaceInput';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from '../inputs/WorkspaceMemberCreateWithoutWorkspaceInput';
import { WorkspaceMemberScalarWhereInput } from '../inputs/WorkspaceMemberScalarWhereInput';
import { WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput } from '../inputs/WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput';
import { WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput } from '../inputs/WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput';
import { WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput } from '../inputs/WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput';
import { WorkspaceMemberWhereUniqueInput } from '../inputs/WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput', {
  isAbstract: true,
})
export class WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput {
  @TypeGraphQL.Field((_type) => [WorkspaceMemberCreateWithoutWorkspaceInput], {
    nullable: true,
  })
  create?: WorkspaceMemberCreateWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [WorkspaceMemberCreateOrConnectWithoutWorkspaceInput],
    {
      nullable: true,
    },
  )
  connectOrCreate?:
    | WorkspaceMemberCreateOrConnectWithoutWorkspaceInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput],
    {
      nullable: true,
    },
  )
  upsert?:
    | WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => WorkspaceMemberCreateManyWorkspaceInputEnvelope,
    {
      nullable: true,
    },
  )
  createMany?: WorkspaceMemberCreateManyWorkspaceInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberWhereUniqueInput], {
    nullable: true,
  })
  set?: WorkspaceMemberWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: WorkspaceMemberWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberWhereUniqueInput], {
    nullable: true,
  })
  delete?: WorkspaceMemberWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberWhereUniqueInput], {
    nullable: true,
  })
  connect?: WorkspaceMemberWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput],
    {
      nullable: true,
    },
  )
  update?:
    | WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput],
    {
      nullable: true,
    },
  )
  updateMany?:
    | WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: WorkspaceMemberScalarWhereInput[] | undefined;
}
