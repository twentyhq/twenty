import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateInput } from './pipeline-progress-create.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressUpdateInput } from './pipeline-progress-update.input';

@ArgsType()
export class UpsertOnePipelineProgressArgs {

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:false})
    @Type(() => PipelineProgressWhereUniqueInput)
    where!: PipelineProgressWhereUniqueInput;

    @HideField()
    create!: PipelineProgressCreateInput;

    @HideField()
    update!: PipelineProgressUpdateInput;
}
