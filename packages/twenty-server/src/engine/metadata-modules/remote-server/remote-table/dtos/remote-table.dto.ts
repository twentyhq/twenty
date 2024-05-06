import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsEnum, IsOptional } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export enum RemoteTableStatus {
  SYNCED = 'SYNCED',
  NOT_SYNCED = 'NOT_SYNCED',
}

registerEnumType(RemoteTableStatus, {
  name: 'RemoteTableStatus',
  description: 'Status of the table',
});

@ObjectType('RemoteTable')
export class RemoteTableDTO {
  @IDField(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => String)
  name: string;

  @IsEnum(RemoteTableStatus)
  @Field(() => RemoteTableStatus)
  status: RemoteTableStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  schema?: string;
}
