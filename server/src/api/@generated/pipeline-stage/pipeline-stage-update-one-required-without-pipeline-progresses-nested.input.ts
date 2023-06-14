import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineProgressesInput } from './pipeline-stage-create-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateOrConnectWithoutPipelineProgressesInput } from './pipeline-stage-create-or-connect-without-pipeline-progresses.input';
import { PipelineStageUpsertWithoutPipelineProgressesInput } from './pipeline-stage-upsert-without-pipeline-progresses.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { PipelineStageUpdateWithoutPipelineProgressesInput } from './pipeline-stage-update-without-pipeline-progresses.input';

@InputType()
export class PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput {

    @Field(() => PipelineStageCreateWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineStageCreateWithoutPipelineProgressesInput)
    create?: PipelineStageCreateWithoutPipelineProgressesInput;

    @Field(() => PipelineStageCreateOrConnectWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineStageCreateOrConnectWithoutPipelineProgressesInput)
    connectOrCreate?: PipelineStageCreateOrConnectWithoutPipelineProgressesInput;

    @Field(() => PipelineStageUpsertWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineStageUpsertWithoutPipelineProgressesInput)
    upsert?: PipelineStageUpsertWithoutPipelineProgressesInput;

    @Field(() => PipelineStageWhereUniqueInput, {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: PipelineStageWhereUniqueInput;

    @Field(() => PipelineStageUpdateWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineStageUpdateWithoutPipelineProgressesInput)
    update?: PipelineStageUpdateWithoutPipelineProgressesInput;
}
