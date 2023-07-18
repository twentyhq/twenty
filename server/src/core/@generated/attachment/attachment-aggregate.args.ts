import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentWhereInput } from './attachment-where.input';
import { Type } from 'class-transformer';
import { AttachmentOrderByWithRelationInput } from './attachment-order-by-with-relation.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Int } from '@nestjs/graphql';
import { AttachmentCountAggregateInput } from './attachment-count-aggregate.input';
import { AttachmentMinAggregateInput } from './attachment-min-aggregate.input';
import { AttachmentMaxAggregateInput } from './attachment-max-aggregate.input';

@ArgsType()
export class AttachmentAggregateArgs {

    @Field(() => AttachmentWhereInput, {nullable:true})
    @Type(() => AttachmentWhereInput)
    where?: AttachmentWhereInput;

    @Field(() => [AttachmentOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<AttachmentOrderByWithRelationInput>;

    @Field(() => AttachmentWhereUniqueInput, {nullable:true})
    cursor?: AttachmentWhereUniqueInput;

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
