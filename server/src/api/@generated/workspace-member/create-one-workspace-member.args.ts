import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberCreateInput } from './workspace-member-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOneWorkspaceMemberArgs {
  @Field(() => WorkspaceMemberCreateInput, { nullable: false })
  @Type(() => WorkspaceMemberCreateInput)
  data!: WorkspaceMemberCreateInput;
}
