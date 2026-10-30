import { Field, InputType } from '@nestjs/graphql';

import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

@InputType()
export class AiTaskStatesInput {
  @Field(() => [String])
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  taskIds: string[];
}
