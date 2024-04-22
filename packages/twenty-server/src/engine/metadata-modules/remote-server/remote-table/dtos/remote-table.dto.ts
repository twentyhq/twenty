import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

import { IsEnum } from 'class-validator';

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
  @Field(() => String)
  name: string;

  @IsEnum(RemoteTableStatus)
  @Field(() => RemoteTableStatus)
  status: RemoteTableStatus;

  @Field(() => String)
  schema: string;
}
