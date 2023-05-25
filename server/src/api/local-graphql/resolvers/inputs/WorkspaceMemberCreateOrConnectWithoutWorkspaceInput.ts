import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from './WorkspaceMemberCreateWithoutWorkspaceInput';
import { WorkspaceMemberWhereUniqueInput } from './WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceMemberCreateOrConnectWithoutWorkspaceInput', {
  isAbstract: true,
})
export class WorkspaceMemberCreateOrConnectWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => WorkspaceMemberWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceMemberWhereUniqueInput;

  @TypeGraphQL.Field((_type) => WorkspaceMemberCreateWithoutWorkspaceInput, {
    nullable: false,
  })
  create!: WorkspaceMemberCreateWithoutWorkspaceInput;
}
