import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from './workspace-member-create-without-workspace.input';

@InputType()
export class WorkspaceMemberCreateOrConnectWithoutWorkspaceInput {

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    where!: WorkspaceMemberWhereUniqueInput;

    @Field(() => WorkspaceMemberCreateWithoutWorkspaceInput, {nullable:false})
    @Type(() => WorkspaceMemberCreateWithoutWorkspaceInput)
    create!: WorkspaceMemberCreateWithoutWorkspaceInput;
}
