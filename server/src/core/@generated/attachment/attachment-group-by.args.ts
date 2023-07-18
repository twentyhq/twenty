import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentWhereInput } from './attachment-where.input';
import { Type } from 'class-transformer';
import { AttachmentOrderByWithAggregationInput } from './attachment-order-by-with-aggregation.input';
import { AttachmentScalarFieldEnum } from './attachment-scalar-field.enum';
import { AttachmentScalarWhereWithAggregatesInput } from './attachment-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { AttachmentCountAggregateInput } from './attachment-count-aggregate.input';
import { AttachmentMinAggregateInput } from './attachment-min-aggregate.input';
import { AttachmentMaxAggregateInput } from './attachment-max-aggregate.input';

@ArgsType()
export class AttachmentGroupByArgs {

    @Field(() => AttachmentWhereInput, {nullable:true})
    @Type(() => AttachmentWhereInput)
    where?: AttachmentWhereInput;

    @Field(() => [AttachmentOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<AttachmentOrderByWithAggregationInput>;

    @Field(() => [AttachmentScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof AttachmentScalarFieldEnum>;

    @Field(() => AttachmentScalarWhereWithAggregatesInput, {nullable:true})
    having?: AttachmentScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => AttachmentCountAggregateInput, {nullable:true})
    _count?: AttachmentCountAggregateInput;

    @Field(() => AttachmentMinAggregateInput, {nullable:true})
    _min?: AttachmentMinAggregateInput;

    @Field(() => AttachmentMaxAggregateInput, {nullable:true})
    _max?: AttachmentMaxAggregateInput;
}
