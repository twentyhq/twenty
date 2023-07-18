import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from './workspace-member-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCreateOrConnectWithoutWorkspaceInput } from './workspace-member-create-or-connect-without-workspace.input';
import { WorkspaceMemberCreateManyWorkspaceInputEnvelope } from './workspace-member-create-many-workspace-input-envelope.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<WorkspaceMemberCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<WorkspaceMemberCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: WorkspaceMemberCreateManyWorkspaceInputEnvelope;

    @Field(() => [WorkspaceMemberWhereUniqueInput], {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    connect?: Array<WorkspaceMemberWhereUniqueInput>;
}
