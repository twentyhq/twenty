import { ObjectType, Field, HideField, ID } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  ForeignDataWrapperOptions,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { GetUserMappingOptions } from 'src/engine/metadata-modules/remote-server/utils/user-mapping-options.utils';

@ObjectType('RemoteServer')
export class RemoteServerDTO<T extends RemoteServerType> {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  foreignDataWrapperId: string;

  @Field(() => String)
  foreignDataWrapperType: T;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  foreignDataWrapperOptions?: ForeignDataWrapperOptions<T>;

  @IsOptional()
  @Field(() => GetUserMappingOptions, { nullable: true })
  userMappingOptions?: GetUserMappingOptions;

  @IsOptional()
  @Field(() => String, { nullable: true })
  schema?: string;

  @HideField()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
