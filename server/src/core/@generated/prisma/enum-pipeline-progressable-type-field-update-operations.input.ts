import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from './pipeline-progressable-type.enum';

@InputType()
export class EnumPipelineProgressableTypeFieldUpdateOperationsInput {
  @Field(() => PipelineProgressableType, { nullable: true })
  set?: keyof typeof PipelineProgressableType;
}
