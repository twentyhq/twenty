import { Field, ObjectType, OmitType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { ConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account.dto';

@ObjectType('PublicConnectionParametersOutput')
class PublicConnectionParametersDTO {
  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => EmailConnectionSecurity, { nullable: true })
  connectionSecurity?: EmailConnectionSecurity;
}

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
