import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineStagesInput } from './workspace-create-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutPipelineStagesInput } from './workspace-create-or-connect-without-pipeline-stages.input';
import { WorkspaceUpsertWithoutPipelineStagesInput } from './workspace-upsert-without-pipeline-stages.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceUpdateWithoutPipelineStagesInput } from './workspace-update-without-pipeline-stages.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutPipelineStagesNestedInput {

    @HideField()
    create?: WorkspaceCreateWithoutPipelineStagesInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineStagesInput;

    @HideField()
    upsert?: WorkspaceUpsertWithoutPipelineStagesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @HideField()
    update?: WorkspaceUpdateWithoutPipelineStagesInput;
}
