import { Field, InputType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  type ForeignDataWrapperOptions,
  type RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  type UserMappingOptions,
  UserMappingOptionsUpdateInput,
} from 'src/engine/metadata-modules/remote-server/types/user-mapping-options';

@InputType()
export class UpdateRemoteServerInput<T extends RemoteServerType> {
  @Field(() => UUIDScalarType)
  id: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  foreignDataWrapperOptions?: Partial<ForeignDataWrapperOptions<T>>;

  @IsOptional()
  @Field(() => String, { nullable: true })
  label?: string;

  @IsOptional()
  @Field(() => UserMappingOptionsUpdateInput, { nullable: true })
  userMappingOptions?: Partial<UserMappingOptions>;

  @IsOptional()
  @Field(() => String, { nullable: true })
  schema?: string;
}
