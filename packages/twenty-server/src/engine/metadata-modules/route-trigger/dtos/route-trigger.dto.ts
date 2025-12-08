import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { HTTPMethod } from 'twenty-shared/types';

registerEnumType(HTTPMethod, { name: 'HTTPMethod' });

@ObjectType('RouteTrigger')
export class RouteTriggerDTO {
  @Field(() => ID)
  id: string;

  @Field()
  path: string;

  @Field()
  isAuthRequired: boolean;

  @Field(() => HTTPMethod)
  httpMethod: HTTPMethod;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
