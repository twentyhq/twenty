import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('EmitAppEventOutput')
export class EmitAppEventOutput {
  @Field()
  id: string;

  @Field()
  occurredAt: string;
}
