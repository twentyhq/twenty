import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonWhereInput } from './person-where.input';
import { Type } from 'class-transformer';
import { PersonOrderByWithAggregationInput } from './person-order-by-with-aggregation.input';
import { PersonScalarFieldEnum } from './person-scalar-field.enum';
import { PersonScalarWhereWithAggregatesInput } from './person-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { PersonCountAggregateInput } from './person-count-aggregate.input';
import { PersonMinAggregateInput } from './person-min-aggregate.input';
import { PersonMaxAggregateInput } from './person-max-aggregate.input';

@ArgsType()
export class PersonGroupByArgs {

    @Field(() => PersonWhereInput, {nullable:true})
    @Type(() => PersonWhereInput)
    where?: PersonWhereInput;

    @Field(() => [PersonOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<PersonOrderByWithAggregationInput>;

    @Field(() => [PersonScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof PersonScalarFieldEnum>;

    @Field(() => PersonScalarWhereWithAggregatesInput, {nullable:true})
    having?: PersonScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => PersonCountAggregateInput, {nullable:true})
    _count?: PersonCountAggregateInput;

    @Field(() => PersonMinAggregateInput, {nullable:true})
    _min?: PersonMinAggregateInput;

    @Field(() => PersonMaxAggregateInput, {nullable:true})
    _max?: PersonMaxAggregateInput;
}
