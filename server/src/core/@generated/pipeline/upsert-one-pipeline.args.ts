import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateInput } from './pipeline-create.input';
import { HideField } from '@nestjs/graphql';
import { PipelineUpdateInput } from './pipeline-update.input';

@ArgsType()
export class UpsertOnePipelineArgs {

    @Field(() => PipelineWhereUniqueInput, {nullable:false})
    @Type(() => PipelineWhereUniqueInput)
    where!: PipelineWhereUniqueInput;

    @HideField()
    create!: PipelineCreateInput;

    @HideField()
    update!: PipelineUpdateInput;
}
