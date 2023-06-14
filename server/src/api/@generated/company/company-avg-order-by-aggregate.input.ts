import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';

@InputType()
export class CompanyAvgOrderByAggregateInput {

    @Field(() => SortOrder, {nullable:true})
    employees?: keyof typeof SortOrder;
}
