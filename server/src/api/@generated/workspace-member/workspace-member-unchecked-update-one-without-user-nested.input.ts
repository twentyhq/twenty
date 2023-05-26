import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutUserInput } from './workspace-member-create-without-user.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateOrConnectWithoutUserInput } from './workspace-member-create-or-connect-without-user.input';
import { WorkspaceMemberUpsertWithoutUserInput } from './workspace-member-upsert-without-user.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { WorkspaceMemberUpdateWithoutUserInput } from './workspace-member-update-without-user.input';

@InputType()
export class WorkspaceMemberUncheckedUpdateOneWithoutUserNestedInput {

    @Field(() => WorkspaceMemberCreateWithoutUserInput, {nullable:true})
    @Type(() => WorkspaceMemberCreateWithoutUserInput)
    create?: WorkspaceMemberCreateWithoutUserInput;

    @Field(() => WorkspaceMemberCreateOrConnectWithoutUserInput, {nullable:true})
    @Type(() => WorkspaceMemberCreateOrConnectWithoutUserInput)
    connectOrCreate?: WorkspaceMemberCreateOrConnectWithoutUserInput;

    @Field(() => WorkspaceMemberUpsertWithoutUserInput, {nullable:true})
    @Type(() => WorkspaceMemberUpsertWithoutUserInput)
    upsert?: WorkspaceMemberUpsertWithoutUserInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @Field(() => Boolean, {nullable:true})
    delete?: boolean;

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    connect?: WorkspaceMemberWhereUniqueInput;

    @Field(() => WorkspaceMemberUpdateWithoutUserInput, {nullable:true})
    @Type(() => WorkspaceMemberUpdateWithoutUserInput)
    update?: WorkspaceMemberUpdateWithoutUserInput;
}
