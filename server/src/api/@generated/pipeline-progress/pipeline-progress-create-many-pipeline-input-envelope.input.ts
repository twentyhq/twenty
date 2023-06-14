import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateManyPipelineInput } from './pipeline-progress-create-many-pipeline.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineProgressCreateManyPipelineInputEnvelope {

    @Field(() => [PipelineProgressCreateManyPipelineInput], {nullable:false})
    @Type(() => PipelineProgressCreateManyPipelineInput)
    data!: Array<PipelineProgressCreateManyPipelineInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
