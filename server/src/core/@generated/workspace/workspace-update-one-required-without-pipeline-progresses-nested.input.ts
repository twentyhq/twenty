import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineProgressesInput } from './workspace-create-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutPipelineProgressesInput } from './workspace-create-or-connect-without-pipeline-progresses.input';
import { WorkspaceUpsertWithoutPipelineProgressesInput } from './workspace-upsert-without-pipeline-progresses.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceUpdateWithoutPipelineProgressesInput } from './workspace-update-without-pipeline-progresses.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutPipelineProgressesNestedInput {

    @HideField()
    create?: WorkspaceCreateWithoutPipelineProgressesInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineProgressesInput;

    @HideField()
    upsert?: WorkspaceUpsertWithoutPipelineProgressesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @HideField()
    update?: WorkspaceUpdateWithoutPipelineProgressesInput;
}
