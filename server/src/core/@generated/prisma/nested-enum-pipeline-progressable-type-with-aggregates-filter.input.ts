import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from './pipeline-progressable-type.enum';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedEnumPipelineProgressableTypeFilter } from './nested-enum-pipeline-progressable-type-filter.input';

@InputType()
export class NestedEnumPipelineProgressableTypeWithAggregatesFilter {

    @Field(() => PipelineProgressableType, {nullable:true})
    equals?: keyof typeof PipelineProgressableType;

    @Field(() => [PipelineProgressableType], {nullable:true})
    in?: Array<keyof typeof PipelineProgressableType>;

    @Field(() => [PipelineProgressableType], {nullable:true})
    notIn?: Array<keyof typeof PipelineProgressableType>;

    @Field(() => NestedEnumPipelineProgressableTypeWithAggregatesFilter, {nullable:true})
    not?: NestedEnumPipelineProgressableTypeWithAggregatesFilter;

    @Field(() => NestedIntFilter, {nullable:true})
    _count?: NestedIntFilter;

    @Field(() => NestedEnumPipelineProgressableTypeFilter, {nullable:true})
    _min?: NestedEnumPipelineProgressableTypeFilter;

    @Field(() => NestedEnumPipelineProgressableTypeFilter, {nullable:true})
    _max?: NestedEnumPipelineProgressableTypeFilter;
}
