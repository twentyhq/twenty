import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineWhereInput } from './pipeline-where.input';
import { Type } from 'class-transformer';
import { PipelineOrderByWithRelationInput } from './pipeline-order-by-with-relation.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PipelineScalarFieldEnum } from './pipeline-scalar-field.enum';

@ArgsType()
export class FindManyPipelineArgs {

    @Field(() => PipelineWhereInput, {nullable:true})
    @Type(() => PipelineWhereInput)
    where?: PipelineWhereInput;

    @Field(() => [PipelineOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<PipelineOrderByWithRelationInput>;

    @Field(() => PipelineWhereUniqueInput, {nullable:true})
    cursor?: PipelineWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => [PipelineScalarFieldEnum], {nullable:true})
    distinct?: Array<keyof typeof PipelineScalarFieldEnum>;
}
