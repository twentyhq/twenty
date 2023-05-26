import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutWorkspaceMemberInput } from './user-create-without-workspace-member.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutWorkspaceMemberInput } from './user-create-or-connect-without-workspace-member.input';
import { UserUpsertWithoutWorkspaceMemberInput } from './user-upsert-without-workspace-member.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutWorkspaceMemberInput } from './user-update-without-workspace-member.input';

@InputType()
export class UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput {

    @Field(() => UserCreateWithoutWorkspaceMemberInput, {nullable:true})
    @Type(() => UserCreateWithoutWorkspaceMemberInput)
    create?: UserCreateWithoutWorkspaceMemberInput;

    @Field(() => UserCreateOrConnectWithoutWorkspaceMemberInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutWorkspaceMemberInput)
    connectOrCreate?: UserCreateOrConnectWithoutWorkspaceMemberInput;

    @Field(() => UserUpsertWithoutWorkspaceMemberInput, {nullable:true})
    @Type(() => UserUpsertWithoutWorkspaceMemberInput)
    upsert?: UserUpsertWithoutWorkspaceMemberInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutWorkspaceMemberInput, {nullable:true})
    @Type(() => UserUpdateWithoutWorkspaceMemberInput)
    update?: UserUpdateWithoutWorkspaceMemberInput;
}
