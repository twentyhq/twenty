import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { WorkspaceMemberCreateInput } from '../../../inputs/WorkspaceMemberCreateInput';
import { WorkspaceMemberUpdateInput } from '../../../inputs/WorkspaceMemberUpdateInput';
import { WorkspaceMemberWhereUniqueInput } from '../../../inputs/WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertOneWorkspaceMemberArgs {
  @TypeGraphQL.Field((_type) => WorkspaceMemberWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceMemberWhereUniqueInput;

  @TypeGraphQL.Field((_type) => WorkspaceMemberCreateInput, {
    nullable: false,
  })
  create!: WorkspaceMemberCreateInput;

  @TypeGraphQL.Field((_type) => WorkspaceMemberUpdateInput, {
    nullable: false,
  })
  update!: WorkspaceMemberUpdateInput;
}
