import { ObjectType, Field, HideField, ID } from '@nestjs/graphql';

import { IDField, QueryOptions } from '@ptc-org/nestjs-query-graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  FdwOptions,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

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
  fdwType: RemoteServerType;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  fdwOptions?: FdwOptions;

  @HideField()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
