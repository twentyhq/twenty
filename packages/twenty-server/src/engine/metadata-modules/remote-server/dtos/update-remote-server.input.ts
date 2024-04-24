import { Field, InputType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  ForeignDataWrapperOptions,
  RemoteServerType,
  UserMappingOptions,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@InputType()
export class UpdateRemoteServerInput<T extends RemoteServerType> {
  @Field(() => String)
  id: T;

  @Field(() => String)
  foreignDataWrapperType: T;

  @IsOptional()
  @Field(() => GraphQLJSON)
  foreignDataWrapperOptions: ForeignDataWrapperOptions<T>;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  userMappingOptions?: UserMappingOptions;
}
