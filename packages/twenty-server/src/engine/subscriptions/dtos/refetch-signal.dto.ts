import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('RefetchSignal')
export class RefetchSignalDTO {
  @Field(() => [String])
  subscriptionIds: string[];
}

