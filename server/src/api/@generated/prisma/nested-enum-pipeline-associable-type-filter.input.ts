import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';

@InputType()
export class NestedEnumPipelineAssociableTypeFilter {
  @Field(() => PipelineAssociableType, { nullable: true })
  equals?: keyof typeof PipelineAssociableType;

  @Field(() => [PipelineAssociableType], { nullable: true })
  in?: Array<keyof typeof PipelineAssociableType>;

  @Field(() => [PipelineAssociableType], { nullable: true })
  notIn?: Array<keyof typeof PipelineAssociableType>;

  @Field(() => NestedEnumPipelineAssociableTypeFilter, { nullable: true })
  not?: NestedEnumPipelineAssociableTypeFilter;
}
