import { InputType, Field } from '@nestjs/graphql';

import { IsString } from 'class-validator';

import { RemoteServerType } from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@InputType()
export class RemoteServerTypeInput {
  @Field(() => String)
  @IsString()
  type!: RemoteServerType;
}
