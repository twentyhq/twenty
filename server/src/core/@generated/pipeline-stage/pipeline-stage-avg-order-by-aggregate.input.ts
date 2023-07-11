import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';

@InputType()
export class PipelineStageAvgOrderByAggregateInput {

    @Field(() => SortOrder, {nullable:true})
    index?: keyof typeof SortOrder;
}
