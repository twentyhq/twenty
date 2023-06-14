import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineWhereInput } from './pipeline-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyPipelineArgs {

    @Field(() => PipelineWhereInput, {nullable:true})
    @Type(() => PipelineWhereInput)
    where?: PipelineWhereInput;
}
