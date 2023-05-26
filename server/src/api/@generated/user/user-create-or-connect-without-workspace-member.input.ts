import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutWorkspaceMemberInput } from './user-create-without-workspace-member.input';

@InputType()
export class UserCreateOrConnectWithoutWorkspaceMemberInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @Field(() => UserCreateWithoutWorkspaceMemberInput, {nullable:false})
    @Type(() => UserCreateWithoutWorkspaceMemberInput)
    create!: UserCreateWithoutWorkspaceMemberInput;
}
