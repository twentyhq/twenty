import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateWithoutUserInput } from './workspace-member-create-without-user.input';

@InputType()
export class WorkspaceMemberCreateOrConnectWithoutUserInput {
  @Field(() => WorkspaceMemberWhereUniqueInput, { nullable: false })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  where!: WorkspaceMemberWhereUniqueInput;

  @Field(() => WorkspaceMemberCreateWithoutUserInput, { nullable: false })
  @Type(() => WorkspaceMemberCreateWithoutUserInput)
  create!: WorkspaceMemberCreateWithoutUserInput;
}
