import { ObjectType, Field, HideField, ID } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UserMappingOptionsDTO } from 'src/engine/metadata-modules/remote-server/dtos/user-mapping-dto';
import {
  ForeignDataWrapperOptions,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@ObjectType('RemoteServer')
export class RemoteServerDTO<T extends RemoteServerType> {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  foreignDataWrapperId: string;

  @Field(() => String)
  foreignDataWrapperType: T;

  @Field(() => String)
  label: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  foreignDataWrapperOptions?: ForeignDataWrapperOptions<T>;

  @IsOptional()
  @Field(() => UserMappingOptionsDTO, { nullable: true })
  userMappingOptions?: UserMappingOptionsDTO;

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
