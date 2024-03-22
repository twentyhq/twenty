import { Field, InputType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  FdwOptions,
  RemoteServerType,
  UserMappingOptions,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@InputType()
export class CreateRemoteServerInput<T extends RemoteServerType> {
  @Field(() => String)
  fdwType: T;

  @IsOptional()
  @Field(() => GraphQLJSON)
  fdwOptions: FdwOptions<T>;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  userMappingOptions?: UserMappingOptions;
}
