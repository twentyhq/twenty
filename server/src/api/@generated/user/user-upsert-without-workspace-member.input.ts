import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutWorkspaceMemberInput } from './user-update-without-workspace-member.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutWorkspaceMemberInput } from './user-create-without-workspace-member.input';

@InputType()
export class UserUpsertWithoutWorkspaceMemberInput {
  @Field(() => UserUpdateWithoutWorkspaceMemberInput, { nullable: false })
  @Type(() => UserUpdateWithoutWorkspaceMemberInput)
  update!: UserUpdateWithoutWorkspaceMemberInput;

  @Field(() => UserCreateWithoutWorkspaceMemberInput, { nullable: false })
  @Type(() => UserCreateWithoutWorkspaceMemberInput)
  create!: UserCreateWithoutWorkspaceMemberInput;
}
