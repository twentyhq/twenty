import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from './workspace-create-without-workspace-member.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutWorkspaceMemberInput } from './workspace-create-or-connect-without-workspace-member.input';
import { WorkspaceUpsertWithoutWorkspaceMemberInput } from './workspace-upsert-without-workspace-member.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceUpdateWithoutWorkspaceMemberInput } from './workspace-update-without-workspace-member.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput {

    @HideField()
    create?: WorkspaceCreateWithoutWorkspaceMemberInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutWorkspaceMemberInput;

    @HideField()
    upsert?: WorkspaceUpsertWithoutWorkspaceMemberInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @HideField()
    update?: WorkspaceUpdateWithoutWorkspaceMemberInput;
}
