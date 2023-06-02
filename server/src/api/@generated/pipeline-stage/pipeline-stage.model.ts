import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { Pipeline } from '../pipeline/pipeline.model';
import { PipelineAssociation } from '../pipeline-association/pipeline-association.model';
import { Workspace } from '../workspace/workspace.model';
import { PipelineStageCount } from './pipeline-stage-count.output';

@ObjectType()
export class PipelineStage {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @Field(() => String, { nullable: false })
  name!: string;

  @Field(() => String, { nullable: false })
  type!: string;

  @Field(() => String, { nullable: false })
  color!: string;

  @Field(() => String, { nullable: false })
  pipelineId!: string;

  @HideField()
  workspaceId!: string;

  @Field(() => Pipeline, { nullable: false })
  pipeline?: Pipeline;

  @Field(() => [PipelineAssociation], { nullable: true })
  pipelineAssociations?: Array<PipelineAssociation>;

  @HideField()
  workspace?: Workspace;

  @HideField()
  _count?: PipelineStageCount;
}
