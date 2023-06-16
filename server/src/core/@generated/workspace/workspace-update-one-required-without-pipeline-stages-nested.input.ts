import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineStagesInput } from './workspace-create-without-pipeline-stages.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPipelineStagesInput } from './workspace-create-or-connect-without-pipeline-stages.input';
import { WorkspaceUpsertWithoutPipelineStagesInput } from './workspace-upsert-without-pipeline-stages.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { WorkspaceUpdateWithoutPipelineStagesInput } from './workspace-update-without-pipeline-stages.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutPipelineStagesNestedInput {

    @Field(() => WorkspaceCreateWithoutPipelineStagesInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutPipelineStagesInput)
    create?: WorkspaceCreateWithoutPipelineStagesInput;

    @Field(() => WorkspaceCreateOrConnectWithoutPipelineStagesInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutPipelineStagesInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineStagesInput;

    @Field(() => WorkspaceUpsertWithoutPipelineStagesInput, {nullable:true})
    @Type(() => WorkspaceUpsertWithoutPipelineStagesInput)
    upsert?: WorkspaceUpsertWithoutPipelineStagesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @Field(() => WorkspaceUpdateWithoutPipelineStagesInput, {nullable:true})
    @Type(() => WorkspaceUpdateWithoutPipelineStagesInput)
    update?: WorkspaceUpdateWithoutPipelineStagesInput;
}
