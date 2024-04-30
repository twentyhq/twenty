import { Field, InputType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  ForeignDataWrapperOptions,
  RemoteServerType,
  UserMappingOptions,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { UserMappingOptionsInput } from 'src/engine/metadata-modules/remote-server/utils/user-mapping-options-input.utils';

@InputType()
export class CreateRemoteServerInput<T extends RemoteServerType> {
  @Field(() => String)
  foreignDataWrapperType: T;

  @Field(() => GraphQLJSON)
  foreignDataWrapperOptions: ForeignDataWrapperOptions<T>;

  @IsOptional()
  @Field(() => UserMappingOptionsInput, { nullable: true })
  userMappingOptions?: UserMappingOptions;

  @IsOptional()
  @Field(() => String, { nullable: true })
  schema?: string;
}
