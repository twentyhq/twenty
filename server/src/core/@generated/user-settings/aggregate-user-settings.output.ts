import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { UserSettingsCountAggregate } from './user-settings-count-aggregate.output';
import { UserSettingsMinAggregate } from './user-settings-min-aggregate.output';
import { UserSettingsMaxAggregate } from './user-settings-max-aggregate.output';

@ObjectType()
export class AggregateUserSettings {

    @Field(() => UserSettingsCountAggregate, {nullable:true})
    _count?: UserSettingsCountAggregate;

    @Field(() => UserSettingsMinAggregate, {nullable:true})
    _min?: UserSettingsMinAggregate;

    @Field(() => UserSettingsMaxAggregate, {nullable:true})
    _max?: UserSettingsMaxAggregate;
}
