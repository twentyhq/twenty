import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';

@ObjectType()
export class PipelineAssociationMinAggregate {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: true })
  pipelineId?: string;

  @Field(() => String, { nullable: true })
  pipelineStageId?: string;

  @Field(() => PipelineAssociableType, { nullable: true })
  associableType?: keyof typeof PipelineAssociableType;

  @Field(() => String, { nullable: true })
  associableId?: string;
}
