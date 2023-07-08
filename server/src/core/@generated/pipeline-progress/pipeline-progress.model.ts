import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { Pipeline } from '../pipeline/pipeline.model';
import { PipelineStage } from '../pipeline-stage/pipeline-stage.model';
import { Workspace } from '../workspace/workspace.model';

@ObjectType()
export class PipelineProgress {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => Int, {nullable:true})
    amount!: number | null;

    @Field(() => Date, {nullable:true})
    closeDate!: Date | null;

    @Field(() => String, {nullable:false})
    pipelineId!: string;

    @Field(() => String, {nullable:false})
    pipelineStageId!: string;

    @Field(() => PipelineProgressableType, {nullable:false})
    progressableType!: keyof typeof PipelineProgressableType;

    @Field(() => String, {nullable:false})
    progressableId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => Pipeline, {nullable:false})
    pipeline?: Pipeline;

    @Field(() => PipelineStage, {nullable:false})
    pipelineStage?: PipelineStage;

    @HideField()
    workspace?: Workspace;
}
