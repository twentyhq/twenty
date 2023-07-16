import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ActivityType } from './activity-type.enum';
import { NestedEnumActivityTypeFilter } from './nested-enum-activity-type-filter.input';

@InputType()
export class EnumActivityTypeFilter {

    @Field(() => ActivityType, {nullable:true})
    equals?: keyof typeof ActivityType;

    @Field(() => [ActivityType], {nullable:true})
    in?: Array<keyof typeof ActivityType>;

    @Field(() => [ActivityType], {nullable:true})
    notIn?: Array<keyof typeof ActivityType>;

    @Field(() => NestedEnumActivityTypeFilter, {nullable:true})
    not?: NestedEnumActivityTypeFilter;
}
