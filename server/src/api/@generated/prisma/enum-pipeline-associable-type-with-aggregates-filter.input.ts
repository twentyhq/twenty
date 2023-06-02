import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';
import { NestedEnumPipelineAssociableTypeWithAggregatesFilter } from './nested-enum-pipeline-associable-type-with-aggregates-filter.input';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedEnumPipelineAssociableTypeFilter } from './nested-enum-pipeline-associable-type-filter.input';

@InputType()
export class EnumPipelineAssociableTypeWithAggregatesFilter {
  @Field(() => PipelineAssociableType, { nullable: true })
  equals?: keyof typeof PipelineAssociableType;

  @Field(() => [PipelineAssociableType], { nullable: true })
  in?: Array<keyof typeof PipelineAssociableType>;

  @Field(() => [PipelineAssociableType], { nullable: true })
  notIn?: Array<keyof typeof PipelineAssociableType>;

  @Field(() => NestedEnumPipelineAssociableTypeWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumPipelineAssociableTypeWithAggregatesFilter;

  @Field(() => NestedIntFilter, { nullable: true })
  _count?: NestedIntFilter;

  @Field(() => NestedEnumPipelineAssociableTypeFilter, { nullable: true })
  _min?: NestedEnumPipelineAssociableTypeFilter;

  @Field(() => NestedEnumPipelineAssociableTypeFilter, { nullable: true })
  _max?: NestedEnumPipelineAssociableTypeFilter;
}
