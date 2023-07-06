import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageCreateInput } from './pipeline-stage-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOnePipelineStageArgs {

    @Field(() => PipelineStageCreateInput, {nullable:false})
    @Type(() => PipelineStageCreateInput)
    @ValidateNested({each: true})
    @Type(() => PipelineStageCreateInput)
    data!: PipelineStageCreateInput;
}
