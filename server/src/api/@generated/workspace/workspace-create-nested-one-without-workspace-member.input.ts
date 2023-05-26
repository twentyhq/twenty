import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from './workspace-create-without-workspace-member.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutWorkspaceMemberInput } from './workspace-create-or-connect-without-workspace-member.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutWorkspaceMemberInput {

    @Field(() => WorkspaceCreateWithoutWorkspaceMemberInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutWorkspaceMemberInput)
    create?: WorkspaceCreateWithoutWorkspaceMemberInput;

    @Field(() => WorkspaceCreateOrConnectWithoutWorkspaceMemberInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutWorkspaceMemberInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutWorkspaceMemberInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
