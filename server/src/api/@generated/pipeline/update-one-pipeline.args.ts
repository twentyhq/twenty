import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineUpdateInput } from './pipeline-update.input';
import { Type } from 'class-transformer';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';

@ArgsType()
export class UpdateOnePipelineArgs {

    @Field(() => PipelineUpdateInput, {nullable:false})
    @Type(() => PipelineUpdateInput)
    data!: PipelineUpdateInput;

    @Field(() => PipelineWhereUniqueInput, {nullable:false})
    @Type(() => PipelineWhereUniqueInput)
    where!: PipelineWhereUniqueInput;
}
