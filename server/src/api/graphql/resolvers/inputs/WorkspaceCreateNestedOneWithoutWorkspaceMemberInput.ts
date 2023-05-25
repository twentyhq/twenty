import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateOrConnectWithoutWorkspaceMemberInput } from '../inputs/WorkspaceCreateOrConnectWithoutWorkspaceMemberInput';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from '../inputs/WorkspaceCreateWithoutWorkspaceMemberInput';
import { WorkspaceWhereUniqueInput } from '../inputs/WorkspaceWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceCreateNestedOneWithoutWorkspaceMemberInput', {
  isAbstract: true,
})
export class WorkspaceCreateNestedOneWithoutWorkspaceMemberInput {
  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutWorkspaceMemberInput, {
    nullable: true,
  })
  create?: WorkspaceCreateWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(
    (_type) => WorkspaceCreateOrConnectWithoutWorkspaceMemberInput,
    {
      nullable: true,
    },
  )
  connectOrCreate?:
    | WorkspaceCreateOrConnectWithoutWorkspaceMemberInput
    | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: true,
  })
  connect?: WorkspaceWhereUniqueInput | undefined;
}
