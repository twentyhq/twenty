import { Field, ObjectType } from '@nestjs/graphql';

import { AiTaskStateDTO } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/ai-task-state.dto';

@ObjectType('AiTaskStates')
export class AiTaskStatesDTO {
  @Field(() => [AiTaskStateDTO])
  tasks: AiTaskStateDTO[];
}
