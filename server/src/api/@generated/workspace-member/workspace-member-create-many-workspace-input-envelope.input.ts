import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateManyWorkspaceInput } from './workspace-member-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceMemberCreateManyWorkspaceInputEnvelope {

    @Field(() => [WorkspaceMemberCreateManyWorkspaceInput], {nullable:false})
    @Type(() => WorkspaceMemberCreateManyWorkspaceInput)
    data!: Array<WorkspaceMemberCreateManyWorkspaceInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
