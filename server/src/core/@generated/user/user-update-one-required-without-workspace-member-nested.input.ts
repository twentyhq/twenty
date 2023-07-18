import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutWorkspaceMemberInput } from './user-create-without-workspace-member.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutWorkspaceMemberInput } from './user-create-or-connect-without-workspace-member.input';
import { UserUpsertWithoutWorkspaceMemberInput } from './user-upsert-without-workspace-member.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserUpdateWithoutWorkspaceMemberInput } from './user-update-without-workspace-member.input';

@InputType()
export class UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput {

    @HideField()
    create?: UserCreateWithoutWorkspaceMemberInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutWorkspaceMemberInput;

    @HideField()
    upsert?: UserUpsertWithoutWorkspaceMemberInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @HideField()
    update?: UserUpdateWithoutWorkspaceMemberInput;
}
