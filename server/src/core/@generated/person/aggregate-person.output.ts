import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PersonCountAggregate } from './person-count-aggregate.output';
import { PersonMinAggregate } from './person-min-aggregate.output';
import { PersonMaxAggregate } from './person-max-aggregate.output';

@ObjectType()
export class AggregatePerson {

    @Field(() => PersonCountAggregate, {nullable:true})
    _count?: PersonCountAggregate;

    @Field(() => PersonMinAggregate, {nullable:true})
    _min?: PersonMinAggregate;

    @Field(() => PersonMaxAggregate, {nullable:true})
    _max?: PersonMaxAggregate;
}
