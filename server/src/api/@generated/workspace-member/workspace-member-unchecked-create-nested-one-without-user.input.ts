import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutUserInput } from './workspace-member-create-without-user.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateOrConnectWithoutUserInput } from './workspace-member-create-or-connect-without-user.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';

@InputType()
export class WorkspaceMemberUncheckedCreateNestedOneWithoutUserInput {
  @Field(() => WorkspaceMemberCreateWithoutUserInput, { nullable: true })
  @Type(() => WorkspaceMemberCreateWithoutUserInput)
  create?: WorkspaceMemberCreateWithoutUserInput;

  @Field(() => WorkspaceMemberCreateOrConnectWithoutUserInput, {
    nullable: true,
  })
  @Type(() => WorkspaceMemberCreateOrConnectWithoutUserInput)
  connectOrCreate?: WorkspaceMemberCreateOrConnectWithoutUserInput;

  @Field(() => WorkspaceMemberWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  connect?: WorkspaceMemberWhereUniqueInput;
}
