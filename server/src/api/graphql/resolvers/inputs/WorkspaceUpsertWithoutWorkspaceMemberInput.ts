import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from '../inputs/WorkspaceCreateWithoutWorkspaceMemberInput';
import { WorkspaceUpdateWithoutWorkspaceMemberInput } from '../inputs/WorkspaceUpdateWithoutWorkspaceMemberInput';

@TypeGraphQL.InputType('WorkspaceUpsertWithoutWorkspaceMemberInput', {
  isAbstract: true,
})
export class WorkspaceUpsertWithoutWorkspaceMemberInput {
  @TypeGraphQL.Field((_type) => WorkspaceUpdateWithoutWorkspaceMemberInput, {
    nullable: false,
  })
  update!: WorkspaceUpdateWithoutWorkspaceMemberInput;

  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutWorkspaceMemberInput, {
    nullable: false,
  })
  create!: WorkspaceCreateWithoutWorkspaceMemberInput;
}
