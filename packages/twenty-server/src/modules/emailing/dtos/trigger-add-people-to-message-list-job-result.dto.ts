import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TriggerAddPeopleToMessageListJobResult')
export class TriggerAddPeopleToMessageListJobResultDTO {
  @Field()
  jobId: string;
}
