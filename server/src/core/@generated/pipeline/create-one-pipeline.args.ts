import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineCreateInput } from './pipeline-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOnePipelineArgs {

    @Field(() => PipelineCreateInput, {nullable:false})
    @Type(() => PipelineCreateInput)
    data!: PipelineCreateInput;
}
