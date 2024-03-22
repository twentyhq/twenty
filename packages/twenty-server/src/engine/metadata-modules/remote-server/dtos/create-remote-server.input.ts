import { Field, InputType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  FdwOptions,
  RemoteServerType,
  UserMappingOptions,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@InputType()
export class CreateRemoteServerInput {
  @Field(() => String)
  fdwType: RemoteServerType;

  @IsOptional()
  @Field(() => GraphQLJSON)
  fdwOptions: FdwOptions;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  userMappingOptions?: UserMappingOptions;
}
