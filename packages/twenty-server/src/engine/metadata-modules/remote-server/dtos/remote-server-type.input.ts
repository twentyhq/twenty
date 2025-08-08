import { InputType, Field } from '@nestjs/graphql';

import { IsString } from 'class-validator';

import { type RemoteServerType } from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@InputType()
export class RemoteServerTypeInput<T extends RemoteServerType> {
  @Field(() => String)
  @IsString()
  foreignDataWrapperType!: T;
}
