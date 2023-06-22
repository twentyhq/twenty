import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineProgressesInput } from './pipeline-stage-create-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateOrConnectWithoutPipelineProgressesInput } from './pipeline-stage-create-or-connect-without-pipeline-progresses.input';
import { PipelineStageUpsertWithoutPipelineProgressesInput } from './pipeline-stage-upsert-without-pipeline-progresses.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateWithoutPipelineProgressesInput } from './pipeline-stage-update-without-pipeline-progresses.input';

@InputType()
export class PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput {

    @HideField()
    create?: PipelineStageCreateWithoutPipelineProgressesInput;

    @HideField()
    connectOrCreate?: PipelineStageCreateOrConnectWithoutPipelineProgressesInput;

    @HideField()
    upsert?: PipelineStageUpsertWithoutPipelineProgressesInput;

    @Field(() => PipelineStageWhereUniqueInput, {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: PipelineStageWhereUniqueInput;

    @HideField()
    update?: PipelineStageUpdateWithoutPipelineProgressesInput;
}
