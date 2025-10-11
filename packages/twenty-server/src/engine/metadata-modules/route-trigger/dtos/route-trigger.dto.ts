import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { HTTPMethod } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';

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
  serverlessFunctionId: string;

  @Field()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
