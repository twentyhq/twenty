import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from './pipeline-progressable-type.enum';

@InputType()
export class NestedEnumPipelineProgressableTypeFilter {
  @Field(() => PipelineProgressableType, { nullable: true })
  equals?: keyof typeof PipelineProgressableType;

  @Field(() => [PipelineProgressableType], { nullable: true })
  in?: Array<keyof typeof PipelineProgressableType>;

  @Field(() => [PipelineProgressableType], { nullable: true })
  notIn?: Array<keyof typeof PipelineProgressableType>;

  @Field(() => NestedEnumPipelineProgressableTypeFilter, { nullable: true })
  not?: NestedEnumPipelineProgressableTypeFilter;
}
