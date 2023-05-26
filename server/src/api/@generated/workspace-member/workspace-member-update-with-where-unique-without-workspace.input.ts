import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberUpdateWithoutWorkspaceInput } from './workspace-member-update-without-workspace.input';

@InputType()
export class WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    where!: WorkspaceMemberWhereUniqueInput;

    @Field(() => WorkspaceMemberUpdateWithoutWorkspaceInput, {nullable:false})
    @Type(() => WorkspaceMemberUpdateWithoutWorkspaceInput)
    data!: WorkspaceMemberUpdateWithoutWorkspaceInput;
}
