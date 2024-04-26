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
export class UpdateRemoteServerInput<T extends RemoteServerType> {
  @Field(() => String)
  id: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  foreignDataWrapperOptions?: Partial<ForeignDataWrapperOptions<T>>;

  @IsOptional()
  @Field(() => UserMappingOptionsInput, { nullable: true })
  userMappingOptions?: Partial<UserMappingOptions>;
}
