import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from './workspace-member-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCreateOrConnectWithoutWorkspaceInput } from './workspace-member-create-or-connect-without-workspace.input';
import { WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput } from './workspace-member-upsert-with-where-unique-without-workspace.input';
import { WorkspaceMemberCreateManyWorkspaceInputEnvelope } from './workspace-member-create-many-workspace-input-envelope.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput } from './workspace-member-update-with-where-unique-without-workspace.input';
import { WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput } from './workspace-member-update-many-with-where-without-workspace.input';
import { WorkspaceMemberScalarWhereInput } from './workspace-member-scalar-where.input';

@InputType()
export class WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<WorkspaceMemberCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<WorkspaceMemberCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: WorkspaceMemberCreateManyWorkspaceInputEnvelope;

    @Field(() => [WorkspaceMemberWhereUniqueInput], {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    set?: Array<WorkspaceMemberWhereUniqueInput>;

    @Field(() => [WorkspaceMemberWhereUniqueInput], {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    disconnect?: Array<WorkspaceMemberWhereUniqueInput>;

    @HideField()
    delete?: Array<WorkspaceMemberWhereUniqueInput>;

    @Field(() => [WorkspaceMemberWhereUniqueInput], {nullable:true})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    connect?: Array<WorkspaceMemberWhereUniqueInput>;

    @HideField()
    update?: Array<WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<WorkspaceMemberScalarWhereInput>;
}
