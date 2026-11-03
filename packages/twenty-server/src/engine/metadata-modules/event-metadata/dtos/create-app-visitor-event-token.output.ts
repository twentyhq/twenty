import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CreateAppVisitorEventTokenOutput')
export class CreateAppVisitorEventTokenOutput {
  @Field()
  token: string;

  @Field()
  expiresAt: string;
}
