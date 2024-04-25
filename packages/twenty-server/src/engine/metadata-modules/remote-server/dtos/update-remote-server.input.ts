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

  @IsOptional()
  @Field(() => GraphQLJSON)
  foreignDataWrapperOptions?: Partial<ForeignDataWrapperOptions<T>>;

  @IsOptional()
  @Field(() => UserMappingOptionsInput, { nullable: true })
  userMappingOptions?: Partial<UserMappingOptions>;
}

@InputType()
class UserMappingOptionsInput {
  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  password?: string;
}
