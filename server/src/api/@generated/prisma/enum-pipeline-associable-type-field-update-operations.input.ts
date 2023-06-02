import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';

@InputType()
export class EnumPipelineAssociableTypeFieldUpdateOperationsInput {
  @Field(() => PipelineAssociableType, { nullable: true })
  set?: keyof typeof PipelineAssociableType;
}
