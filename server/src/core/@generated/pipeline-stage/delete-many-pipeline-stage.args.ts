import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageWhereInput } from './pipeline-stage-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyPipelineStageArgs {

    @Field(() => PipelineStageWhereInput, {nullable:true})
    @Type(() => PipelineStageWhereInput)
    where?: PipelineStageWhereInput;
}
