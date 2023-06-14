import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressWhereInput } from './pipeline-progress-where.input';
import { Type } from 'class-transformer';
import { PipelineProgressOrderByWithRelationInput } from './pipeline-progress-order-by-with-relation.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PipelineProgressScalarFieldEnum } from './pipeline-progress-scalar-field.enum';

@ArgsType()
export class FindManyPipelineProgressArgs {
  @Field(() => PipelineProgressWhereInput, { nullable: true })
  @Type(() => PipelineProgressWhereInput)
  where?: PipelineProgressWhereInput;

  @Field(() => [PipelineProgressOrderByWithRelationInput], { nullable: true })
  orderBy?: Array<PipelineProgressOrderByWithRelationInput>;

  @Field(() => PipelineProgressWhereUniqueInput, { nullable: true })
  cursor?: PipelineProgressWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => [PipelineProgressScalarFieldEnum], { nullable: true })
  distinct?: Array<keyof typeof PipelineProgressScalarFieldEnum>;
}
