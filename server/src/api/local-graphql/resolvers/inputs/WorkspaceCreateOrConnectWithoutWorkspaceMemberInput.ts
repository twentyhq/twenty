import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from './WorkspaceCreateWithoutWorkspaceMemberInput';
import { WorkspaceWhereUniqueInput } from './WorkspaceWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceCreateOrConnectWithoutWorkspaceMemberInput', {
  isAbstract: true,
})
export class WorkspaceCreateOrConnectWithoutWorkspaceMemberInput {
  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceWhereUniqueInput;

  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutWorkspaceMemberInput, {
    nullable: false,
  })
  create!: WorkspaceCreateWithoutWorkspaceMemberInput;
}
