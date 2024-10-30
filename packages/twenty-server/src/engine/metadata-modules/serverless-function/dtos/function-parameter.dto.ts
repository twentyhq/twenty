import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FunctionParameter {
  @Field(() => String)
  name: string;

  @Field(() => String)
  type: string;
}
