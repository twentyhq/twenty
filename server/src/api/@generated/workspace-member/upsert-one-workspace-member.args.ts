import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateInput } from './workspace-member-create.input';
import { WorkspaceMemberUpdateInput } from './workspace-member-update.input';

@ArgsType()
export class UpsertOneWorkspaceMemberArgs {
  @Field(() => WorkspaceMemberWhereUniqueInput, { nullable: false })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  where!: WorkspaceMemberWhereUniqueInput;

  @Field(() => WorkspaceMemberCreateInput, { nullable: false })
  @Type(() => WorkspaceMemberCreateInput)
  create!: WorkspaceMemberCreateInput;

  @Field(() => WorkspaceMemberUpdateInput, { nullable: false })
  @Type(() => WorkspaceMemberUpdateInput)
  update!: WorkspaceMemberUpdateInput;
}
