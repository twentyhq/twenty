import { InputType, Field, ID } from '@nestjs/graphql';

import { IsEnum } from 'class-validator';

import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';

@InputType()
export class RemoteTableInput {
  @Field(() => ID)
  remoteServerId: string;

  @Field(() => String)
  name: string;

  @IsEnum(RemoteTableStatus)
  @Field(() => RemoteTableStatus)
  status: RemoteTableStatus;

  @Field(() => String)
  schema: string;
}
