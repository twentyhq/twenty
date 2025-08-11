import { Field, InputType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  ForeignDataWrapperOptions,
  type RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { UserMappingOptions } from 'src/engine/metadata-modules/remote-server/types/user-mapping-options';

@InputType()
export class CreateRemoteServerInput<T extends RemoteServerType> {
  @Field(() => String)
  foreignDataWrapperType: T;

  @Field(() => GraphQLJSON)
  foreignDataWrapperOptions: ForeignDataWrapperOptions<T>;

  @Field(() => String)
  label: string;

  @IsOptional()
  @Field(() => UserMappingOptions, { nullable: true })
  userMappingOptions?: UserMappingOptions;

  @IsOptional()
  @Field(() => String, { nullable: true })
  schema?: string;
}
