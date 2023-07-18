import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineInput } from './pipeline-progress-create-without-pipeline.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateOrConnectWithoutPipelineInput } from './pipeline-progress-create-or-connect-without-pipeline.input';
import { PipelineProgressCreateManyPipelineInputEnvelope } from './pipeline-progress-create-many-pipeline-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineProgressCreateNestedManyWithoutPipelineInput {

    @HideField()
    create?: Array<PipelineProgressCreateWithoutPipelineInput>;

    @HideField()
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPipelineInput>;

    @HideField()
    createMany?: PipelineProgressCreateManyPipelineInputEnvelope;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    connect?: Array<PipelineProgressWhereUniqueInput>;
}
