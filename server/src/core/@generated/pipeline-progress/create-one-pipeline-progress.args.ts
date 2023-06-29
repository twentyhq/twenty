import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressCreateInput } from './pipeline-progress-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOnePipelineProgressArgs {

    @Field(() => PipelineProgressCreateInput, {nullable:false})
    @Type(() => PipelineProgressCreateInput)
    @ValidateNested({each: true})
    @Type(() => PipelineProgressCreateInput)
    data!: PipelineProgressCreateInput;
}
