import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyWhereInput } from './company-where.input';
import { Type } from 'class-transformer';
import { CompanyOrderByWithAggregationInput } from './company-order-by-with-aggregation.input';
import { CompanyScalarFieldEnum } from './company-scalar-field.enum';
import { CompanyScalarWhereWithAggregatesInput } from './company-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { CompanyCountAggregateInput } from './company-count-aggregate.input';
import { CompanyAvgAggregateInput } from './company-avg-aggregate.input';
import { CompanySumAggregateInput } from './company-sum-aggregate.input';
import { CompanyMinAggregateInput } from './company-min-aggregate.input';
import { CompanyMaxAggregateInput } from './company-max-aggregate.input';

@ArgsType()
export class CompanyGroupByArgs {

    @Field(() => CompanyWhereInput, {nullable:true})
    @Type(() => CompanyWhereInput)
    where?: CompanyWhereInput;

    @Field(() => [CompanyOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<CompanyOrderByWithAggregationInput>;

    @Field(() => [CompanyScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof CompanyScalarFieldEnum>;

    @Field(() => CompanyScalarWhereWithAggregatesInput, {nullable:true})
    having?: CompanyScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => CompanyCountAggregateInput, {nullable:true})
    _count?: CompanyCountAggregateInput;

    @Field(() => CompanyAvgAggregateInput, {nullable:true})
    _avg?: CompanyAvgAggregateInput;

    @Field(() => CompanySumAggregateInput, {nullable:true})
    _sum?: CompanySumAggregateInput;

    @Field(() => CompanyMinAggregateInput, {nullable:true})
    _min?: CompanyMinAggregateInput;

    @Field(() => CompanyMaxAggregateInput, {nullable:true})
    _max?: CompanyMaxAggregateInput;
}
