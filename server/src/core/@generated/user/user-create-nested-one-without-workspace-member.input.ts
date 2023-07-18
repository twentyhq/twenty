import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutWorkspaceMemberInput } from './user-create-without-workspace-member.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutWorkspaceMemberInput } from './user-create-or-connect-without-workspace-member.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserCreateNestedOneWithoutWorkspaceMemberInput {

    @HideField()
    create?: UserCreateWithoutWorkspaceMemberInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutWorkspaceMemberInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
