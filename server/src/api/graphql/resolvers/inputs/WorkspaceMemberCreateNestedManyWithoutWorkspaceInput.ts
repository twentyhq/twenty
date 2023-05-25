import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateManyWorkspaceInputEnvelope } from '../inputs/WorkspaceMemberCreateManyWorkspaceInputEnvelope';
import { WorkspaceMemberCreateOrConnectWithoutWorkspaceInput } from '../inputs/WorkspaceMemberCreateOrConnectWithoutWorkspaceInput';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from '../inputs/WorkspaceMemberCreateWithoutWorkspaceInput';
import { WorkspaceMemberWhereUniqueInput } from '../inputs/WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceMemberCreateNestedManyWithoutWorkspaceInput', {
  isAbstract: true,
})
export class WorkspaceMemberCreateNestedManyWithoutWorkspaceInput {
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
    (_type) => WorkspaceMemberCreateManyWorkspaceInputEnvelope,
    {
      nullable: true,
    },
  )
  createMany?: WorkspaceMemberCreateManyWorkspaceInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberWhereUniqueInput], {
    nullable: true,
  })
  connect?: WorkspaceMemberWhereUniqueInput[] | undefined;
}
