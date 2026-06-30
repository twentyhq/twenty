import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkspaceAiStats')
export class WorkspaceAiStatsDTO {
  @Field(() => Int)
  conversationsCount: number;

  @Field(() => Int)
  skillsCount: number;

  @Field(() => Int)
  toolsCount: number;
}
