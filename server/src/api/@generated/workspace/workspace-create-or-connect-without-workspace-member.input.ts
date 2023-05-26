import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from './workspace-create-without-workspace-member.input';

@InputType()
export class WorkspaceCreateOrConnectWithoutWorkspaceMemberInput {

    @Field(() => WorkspaceWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceWhereUniqueInput)
    where!: WorkspaceWhereUniqueInput;

    @Field(() => WorkspaceCreateWithoutWorkspaceMemberInput, {nullable:false})
    @Type(() => WorkspaceCreateWithoutWorkspaceMemberInput)
    create!: WorkspaceCreateWithoutWorkspaceMemberInput;
}
