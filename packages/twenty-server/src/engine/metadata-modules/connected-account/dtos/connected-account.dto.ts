import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ImapSmtpCaldavConnectionParametersDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';

@ObjectType('ConnectedAccountDTO')
export class ConnectedAccountDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  provider: string;

  @HideField()
  accessToken: string | null;

  @HideField()
  refreshToken: string | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  lastCredentialsRefreshedAt: Date | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  authFailedAt: Date | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  handleAliases: string[] | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  scopes: string[] | null;

  @IsOptional()
  @Field(() => ImapSmtpCaldavConnectionParametersDTO, { nullable: true })
  connectionParameters: ImapSmtpCaldavConnectionParametersDTO | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  lastSignedInAt: Date | null;

  @HideField()
  oidcTokenClaims: Record<string, unknown> | null;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
