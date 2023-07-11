import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineProgress } from '../pipeline-progress/pipeline-progress.model';
import { Pipeline } from '../pipeline/pipeline.model';
import { Workspace } from '../workspace/workspace.model';
import { PipelineStageCount } from './pipeline-stage-count.output';

@ObjectType()
export class PipelineStage {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    type!: string;

    @Field(() => String, {nullable:false})
    color!: string;

    @Field(() => Int, {nullable:true})
    index!: number | null;

    @Field(() => String, {nullable:false})
    pipelineId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => [PipelineProgress], {nullable:true})
    pipelineProgresses?: Array<PipelineProgress>;

    @Field(() => Pipeline, {nullable:false})
    pipeline?: Pipeline;

    @HideField()
    workspace?: Workspace;

    @HideField()
    _count?: PipelineStageCount;
}
