import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutUserInput } from './workspace-member-create-without-user.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCreateOrConnectWithoutUserInput } from './workspace-member-create-or-connect-without-user.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceMemberCreateNestedOneWithoutUserInput {

    @HideField()
    create?: WorkspaceMemberCreateWithoutUserInput;

    @HideField()
    connectOrCreate?: WorkspaceMemberCreateOrConnectWithoutUserInput;

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    connect?: WorkspaceMemberWhereUniqueInput;
}
