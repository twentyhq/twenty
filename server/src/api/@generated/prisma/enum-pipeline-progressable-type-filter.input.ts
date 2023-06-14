import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from './pipeline-progressable-type.enum';
import { NestedEnumPipelineProgressableTypeFilter } from './nested-enum-pipeline-progressable-type-filter.input';

@InputType()
export class EnumPipelineProgressableTypeFilter {

    @Field(() => PipelineProgressableType, {nullable:true})
    equals?: keyof typeof PipelineProgressableType;

    @Field(() => [PipelineProgressableType], {nullable:true})
    in?: Array<keyof typeof PipelineProgressableType>;

    @Field(() => [PipelineProgressableType], {nullable:true})
    notIn?: Array<keyof typeof PipelineProgressableType>;

    @Field(() => NestedEnumPipelineProgressableTypeFilter, {nullable:true})
    not?: NestedEnumPipelineProgressableTypeFilter;
}
