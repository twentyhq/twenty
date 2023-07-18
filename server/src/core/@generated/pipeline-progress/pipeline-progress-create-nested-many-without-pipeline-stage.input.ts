import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineStageInput } from './pipeline-progress-create-without-pipeline-stage.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateOrConnectWithoutPipelineStageInput } from './pipeline-progress-create-or-connect-without-pipeline-stage.input';
import { PipelineProgressCreateManyPipelineStageInputEnvelope } from './pipeline-progress-create-many-pipeline-stage-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineProgressCreateNestedManyWithoutPipelineStageInput {

    @HideField()
    create?: Array<PipelineProgressCreateWithoutPipelineStageInput>;

    @HideField()
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPipelineStageInput>;

    @HideField()
    createMany?: PipelineProgressCreateManyPipelineStageInputEnvelope;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    connect?: Array<PipelineProgressWhereUniqueInput>;
}
