import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutWorkspaceMemberInput } from './user-create-without-workspace-member.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutWorkspaceMemberInput } from './user-create-or-connect-without-workspace-member.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutWorkspaceMemberInput {
  @Field(() => UserCreateWithoutWorkspaceMemberInput, { nullable: true })
  @Type(() => UserCreateWithoutWorkspaceMemberInput)
  create?: UserCreateWithoutWorkspaceMemberInput;

  @Field(() => UserCreateOrConnectWithoutWorkspaceMemberInput, {
    nullable: true,
  })
  @Type(() => UserCreateOrConnectWithoutWorkspaceMemberInput)
  connectOrCreate?: UserCreateOrConnectWithoutWorkspaceMemberInput;

  @Field(() => UserWhereUniqueInput, { nullable: true })
  @Type(() => UserWhereUniqueInput)
  connect?: UserWhereUniqueInput;
}
