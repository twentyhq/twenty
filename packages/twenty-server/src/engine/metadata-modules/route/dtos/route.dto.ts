import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { HTTPMethod } from 'src/engine/metadata-modules/route/route.entity';

registerEnumType(HTTPMethod, { name: 'HTTPMethod' });

@ObjectType('Route')
export class RouteDTO {
  @Field(() => ID)
  id: string;

  @Field()
  path: string;

  @Field()
  isAuthRequired: boolean;

  @Field(() => HTTPMethod)
  httpMethod: HTTPMethod;

  @Field({ nullable: true })
  serverlessFunctionId?: string;

  @Field()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
