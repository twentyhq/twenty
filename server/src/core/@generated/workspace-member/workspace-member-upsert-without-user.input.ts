import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberUpdateWithoutUserInput } from './workspace-member-update-without-user.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateWithoutUserInput } from './workspace-member-create-without-user.input';

@InputType()
export class WorkspaceMemberUpsertWithoutUserInput {
  @Field(() => WorkspaceMemberUpdateWithoutUserInput, { nullable: false })
  @Type(() => WorkspaceMemberUpdateWithoutUserInput)
  update!: WorkspaceMemberUpdateWithoutUserInput;

  @Field(() => WorkspaceMemberCreateWithoutUserInput, { nullable: false })
  @Type(() => WorkspaceMemberCreateWithoutUserInput)
  create!: WorkspaceMemberCreateWithoutUserInput;
}
