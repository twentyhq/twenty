import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageUpdateInput } from './pipeline-stage-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';

@ArgsType()
export class UpdateOnePipelineStageArgs {

    @Field(() => PipelineStageUpdateInput, {nullable:false})
    @Type(() => PipelineStageUpdateInput)
    @ValidateNested({each: true})
    @Type(() => PipelineStageUpdateInput)
    data!: PipelineStageUpdateInput;

    @Field(() => PipelineStageWhereUniqueInput, {nullable:false})
    @Type(() => PipelineStageWhereUniqueInput)
    where!: PipelineStageWhereUniqueInput;
}
