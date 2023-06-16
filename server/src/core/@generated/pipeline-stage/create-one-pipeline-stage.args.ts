import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageCreateInput } from './pipeline-stage-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOnePipelineStageArgs {

    @Field(() => PipelineStageCreateInput, {nullable:false})
    @Type(() => PipelineStageCreateInput)
    data!: PipelineStageCreateInput;
}
