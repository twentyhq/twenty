import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';
import { Pipeline } from '../pipeline/pipeline.model';
import { PipelineStage } from '../pipeline-stage/pipeline-stage.model';

@ObjectType()
export class PipelineAssociation {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @Field(() => String, { nullable: false })
  pipelineId!: string;

  @Field(() => String, { nullable: false })
  pipelineStageId!: string;

  @Field(() => PipelineAssociableType, { nullable: false })
  associableType!: keyof typeof PipelineAssociableType;

  @Field(() => String, { nullable: false })
  associableId!: string;

  @Field(() => Pipeline, { nullable: false })
  pipeline?: Pipeline;

  @Field(() => PipelineStage, { nullable: false })
  pipelineStage?: PipelineStage;
}
