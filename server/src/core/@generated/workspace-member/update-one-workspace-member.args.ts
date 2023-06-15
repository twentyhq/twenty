import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberUpdateInput } from './workspace-member-update.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';

@ArgsType()
export class UpdateOneWorkspaceMemberArgs {
  @Field(() => WorkspaceMemberUpdateInput, { nullable: false })
  @Type(() => WorkspaceMemberUpdateInput)
  data!: WorkspaceMemberUpdateInput;

  @Field(() => WorkspaceMemberWhereUniqueInput, { nullable: false })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  where!: WorkspaceMemberWhereUniqueInput;
}
