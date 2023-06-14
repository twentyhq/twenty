import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageWhereInput } from './pipeline-stage-where.input';
import { Type } from 'class-transformer';
import { PipelineStageOrderByWithRelationInput } from './pipeline-stage-order-by-with-relation.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PipelineStageScalarFieldEnum } from './pipeline-stage-scalar-field.enum';

@ArgsType()
export class FindFirstPipelineStageOrThrowArgs {

    @Field(() => PipelineStageWhereInput, {nullable:true})
    @Type(() => PipelineStageWhereInput)
    where?: PipelineStageWhereInput;

    @Field(() => [PipelineStageOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<PipelineStageOrderByWithRelationInput>;

    @Field(() => PipelineStageWhereUniqueInput, {nullable:true})
    cursor?: PipelineStageWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => [PipelineStageScalarFieldEnum], {nullable:true})
    distinct?: Array<keyof typeof PipelineStageScalarFieldEnum>;
}
