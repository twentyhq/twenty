import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineInput } from './pipeline-stage-create-without-pipeline.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateOrConnectWithoutPipelineInput } from './pipeline-stage-create-or-connect-without-pipeline.input';
import { PipelineStageCreateManyPipelineInputEnvelope } from './pipeline-stage-create-many-pipeline-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineStageCreateNestedManyWithoutPipelineInput {

    @HideField()
    create?: Array<PipelineStageCreateWithoutPipelineInput>;

    @HideField()
    connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutPipelineInput>;

    @HideField()
    createMany?: PipelineStageCreateManyPipelineInputEnvelope;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: Array<PipelineStageWhereUniqueInput>;
}
