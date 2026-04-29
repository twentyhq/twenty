import { Field, ObjectType, OmitType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

import { ConnectionParametersDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { ConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account.dto';

@ObjectType('PublicConnectionParametersOutput')
class PublicConnectionParametersDTO extends OmitType(ConnectionParametersDTO, [
  'password',
] as const) {}

@ObjectType('PublicImapSmtpCaldavConnectionParameters')
class PublicImapSmtpCaldavConnectionParametersDTO {
  @Field(() => PublicConnectionParametersDTO, { nullable: true })
  IMAP?: PublicConnectionParametersDTO;

  @Field(() => PublicConnectionParametersDTO, { nullable: true })
  SMTP?: PublicConnectionParametersDTO;

  @Field(() => PublicConnectionParametersDTO, { nullable: true })
  CALDAV?: PublicConnectionParametersDTO;
}

@ObjectType('ConnectedAccountPublicDTO')
export class ConnectedAccountPublicDTO extends OmitType(ConnectedAccountDTO, [
  'connectionParameters',
] as const) {
  @IsOptional()
  @Field(() => PublicImapSmtpCaldavConnectionParametersDTO, { nullable: true })
  connectionParameters: PublicImapSmtpCaldavConnectionParametersDTO | null;
}
