import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyWhereInput } from './company-where.input';
import { Type } from 'class-transformer';
import { CompanyOrderByWithRelationInput } from './company-order-by-with-relation.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Int } from '@nestjs/graphql';
import { CompanyCountAggregateInput } from './company-count-aggregate.input';
import { CompanyAvgAggregateInput } from './company-avg-aggregate.input';
import { CompanySumAggregateInput } from './company-sum-aggregate.input';
import { CompanyMinAggregateInput } from './company-min-aggregate.input';
import { CompanyMaxAggregateInput } from './company-max-aggregate.input';

@ArgsType()
export class CompanyAggregateArgs {
  @Field(() => CompanyWhereInput, { nullable: true })
  @Type(() => CompanyWhereInput)
  where?: CompanyWhereInput;

  @Field(() => [CompanyOrderByWithRelationInput], { nullable: true })
  orderBy?: Array<CompanyOrderByWithRelationInput>;

  @Field(() => CompanyWhereUniqueInput, { nullable: true })
  cursor?: CompanyWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => CompanyCountAggregateInput, { nullable: true })
  _count?: CompanyCountAggregateInput;

  @Field(() => CompanyAvgAggregateInput, { nullable: true })
  _avg?: CompanyAvgAggregateInput;

  @Field(() => CompanySumAggregateInput, { nullable: true })
  _sum?: CompanySumAggregateInput;

  @Field(() => CompanyMinAggregateInput, { nullable: true })
  _min?: CompanyMinAggregateInput;

  @Field(() => CompanyMaxAggregateInput, { nullable: true })
  _max?: CompanyMaxAggregateInput;
}
