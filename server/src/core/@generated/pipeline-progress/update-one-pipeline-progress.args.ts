import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressUpdateInput } from './pipeline-progress-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';

@ArgsType()
export class UpdateOnePipelineProgressArgs {

    @Field(() => PipelineProgressUpdateInput, {nullable:false})
    @Type(() => PipelineProgressUpdateInput)
    @Type(() => PipelineProgressUpdateInput)
    @ValidateNested({each: true})
    data!: PipelineProgressUpdateInput;

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:false})
    @Type(() => PipelineProgressWhereUniqueInput)
    where!: PipelineProgressWhereUniqueInput;
}
