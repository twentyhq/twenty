import { ObjectType, Field, HideField, ID } from '@nestjs/graphql';

import { IDField, QueryOptions } from '@ptc-org/nestjs-query-graphql';

@ObjectType('RemoteServer')
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
export class RemoteServerDTO {
  @IDField(() => ID)
  id: string;

  @Field(() => ID)
  fwdId: string;

  @Field(() => String)
  host: string;

  @Field(() => String)
  port: string;

  @Field(() => String)
  database: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  schema: string;

  @HideField()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
