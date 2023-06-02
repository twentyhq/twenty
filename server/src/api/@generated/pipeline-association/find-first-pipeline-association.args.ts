import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationWhereInput } from './pipeline-association-where.input';
import { Type } from 'class-transformer';
import { PipelineAssociationOrderByWithRelationInput } from './pipeline-association-order-by-with-relation.input';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PipelineAssociationScalarFieldEnum } from './pipeline-association-scalar-field.enum';

@ArgsType()
export class FindFirstPipelineAssociationArgs {
  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  @Type(() => PipelineAssociationWhereInput)
  where?: PipelineAssociationWhereInput;

  @Field(() => [PipelineAssociationOrderByWithRelationInput], {
    nullable: true,
  })
  orderBy?: Array<PipelineAssociationOrderByWithRelationInput>;

  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: true })
  cursor?: PipelineAssociationWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => [PipelineAssociationScalarFieldEnum], { nullable: true })
  distinct?: Array<keyof typeof PipelineAssociationScalarFieldEnum>;
}
