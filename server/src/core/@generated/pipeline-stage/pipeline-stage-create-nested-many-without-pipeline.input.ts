import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineInput } from './pipeline-stage-create-without-pipeline.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateOrConnectWithoutPipelineInput } from './pipeline-stage-create-or-connect-without-pipeline.input';
import { PipelineStageCreateManyPipelineInputEnvelope } from './pipeline-stage-create-many-pipeline-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';

@InputType()
export class PipelineStageCreateNestedManyWithoutPipelineInput {

    @Field(() => [PipelineStageCreateWithoutPipelineInput], {nullable:true})
    @Type(() => PipelineStageCreateWithoutPipelineInput)
    create?: Array<PipelineStageCreateWithoutPipelineInput>;

    @Field(() => [PipelineStageCreateOrConnectWithoutPipelineInput], {nullable:true})
    @Type(() => PipelineStageCreateOrConnectWithoutPipelineInput)
    connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutPipelineInput>;

    @Field(() => PipelineStageCreateManyPipelineInputEnvelope, {nullable:true})
    @Type(() => PipelineStageCreateManyPipelineInputEnvelope)
    createMany?: PipelineStageCreateManyPipelineInputEnvelope;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: Array<PipelineStageWhereUniqueInput>;
}
