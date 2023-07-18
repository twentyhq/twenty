import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutUserInput } from './workspace-member-create-without-user.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCreateOrConnectWithoutUserInput } from './workspace-member-create-or-connect-without-user.input';
import { WorkspaceMemberUpsertWithoutUserInput } from './workspace-member-upsert-without-user.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberUpdateWithoutUserInput } from './workspace-member-update-without-user.input';

@InputType()
export class WorkspaceMemberUncheckedUpdateOneWithoutUserNestedInput {

    @HideField()
    create?: WorkspaceMemberCreateWithoutUserInput;

    @HideField()
    connectOrCreate?: WorkspaceMemberCreateOrConnectWithoutUserInput;

    @HideField()
    upsert?: WorkspaceMemberUpsertWithoutUserInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @HideField()
    delete?: boolean;

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    connect?: WorkspaceMemberWhereUniqueInput;

    @HideField()
    update?: WorkspaceMemberUpdateWithoutUserInput;
}
