import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from './workspace-member-create-without-workspace.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateOrConnectWithoutWorkspaceInput } from './workspace-member-create-or-connect-without-workspace.input';
import { WorkspaceMemberCreateManyWorkspaceInputEnvelope } from './workspace-member-create-many-workspace-input-envelope.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';

@InputType()
export class WorkspaceMemberCreateNestedManyWithoutWorkspaceInput {

    @Field(() => [WorkspaceMemberCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => WorkspaceMemberCreateWithoutWorkspaceInput)
    create?: Array<WorkspaceMemberCreateWithoutWorkspaceInput>;

    @Field(() => [WorkspaceMemberCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => WorkspaceMemberCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<WorkspaceMemberCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => WorkspaceMemberCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => WorkspaceMemberCreateManyWorkspaceInputEnvelope)
    createMany?: WorkspaceMemberCreateManyWorkspaceInputEnvelope;

    @Field(() => [WorkspaceMemberWhereUniqueInput], {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    connect?: Array<WorkspaceMemberWhereUniqueInput>;
}
