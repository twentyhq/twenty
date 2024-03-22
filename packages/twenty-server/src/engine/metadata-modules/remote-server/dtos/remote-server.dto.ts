import { ObjectType, Field, HideField, ID } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  FdwOptions,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@ObjectType('RemoteServer')
export class RemoteServerDTO<T extends RemoteServerType> {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  fwdId: string;

  @Field(() => String)
  fdwType: T;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  fdwOptions?: FdwOptions<T>;

  @HideField()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
