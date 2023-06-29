import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineCreateInput } from './pipeline-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOnePipelineArgs {

    @Field(() => PipelineCreateInput, {nullable:false})
    @Type(() => PipelineCreateInput)
    @ValidateNested({each: true})
    @Type(() => PipelineCreateInput)
    data!: PipelineCreateInput;
}
