import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { AttachmentCountAggregate } from './attachment-count-aggregate.output';
import { AttachmentMinAggregate } from './attachment-min-aggregate.output';
import { AttachmentMaxAggregate } from './attachment-max-aggregate.output';

@ObjectType()
export class AggregateAttachment {

    @Field(() => AttachmentCountAggregate, {nullable:true})
    _count?: AttachmentCountAggregate;

    @Field(() => AttachmentMinAggregate, {nullable:true})
    _min?: AttachmentMinAggregate;

    @Field(() => AttachmentMaxAggregate, {nullable:true})
    _max?: AttachmentMaxAggregate;
}
