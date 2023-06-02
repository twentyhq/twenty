import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineStage } from '../pipeline-stage/pipeline-stage.model';
import { PipelineAssociation } from '../pipeline-association/pipeline-association.model';
import { Workspace } from '../workspace/workspace.model';
import { PipelineCount } from './pipeline-count.output';

@ObjectType()
export class Pipeline {
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
  icon!: string;

  @HideField()
  workspaceId!: string;

  @Field(() => [PipelineStage], { nullable: true })
  pipelineStages?: Array<PipelineStage>;

  @Field(() => [PipelineAssociation], { nullable: true })
  pipelineAssociations?: Array<PipelineAssociation>;

  @HideField()
  workspace?: Workspace;

  @Field(() => PipelineCount, { nullable: false })
  _count?: PipelineCount;
}
