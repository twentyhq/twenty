import { ObjectType, Field, HideField, ID } from '@nestjs/graphql';

import { IDField, QueryOptions } from '@ptc-org/nestjs-query-graphql';

import { RemoteServerType } from 'src/engine/metadata-modules/remote-server/remote-server.entity';

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
  schema: string;

  @HideField()
  workspaceId: string;

  @Field(() => String)
  type: RemoteServerType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
