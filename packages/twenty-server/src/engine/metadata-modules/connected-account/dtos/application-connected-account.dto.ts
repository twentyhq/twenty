import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean } from 'class-validator';

import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';

@ObjectType('ApplicationConnectedAccountDTO')
export class ApplicationConnectedAccountDTO extends ConnectedAccountPublicDTO {
  @IsBoolean()
  @Field(() => Boolean)
  isOwnedByCurrentUser: boolean;
}
