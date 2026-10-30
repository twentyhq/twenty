import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountScopeEnum } from 'src/engine/metadata-modules/connected-account/enums/connected-account-scope.enum';

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

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  authFailedReason: string | null;

  // Set when the account is disconnected or frozen: synced data is kept but
  // cannot be updated until the account is reconnected.
  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  archivedAt: Date | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  handleAliases: string[] | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  scopes: string[] | null;

  @HideField()
  connectionParameters: ImapSmtpCaldavParams | null;

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

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  connectionProviderId: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  applicationId: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name: string | null;

  @IsEnum(ConnectedAccountScopeEnum)
  @Field(() => ConnectedAccountScopeEnum)
  scope: ConnectedAccountScope;

  @IsString()
  @Field(() => String, { deprecationReason: 'Use scope instead.' })
  visibility: 'user' | 'workspace';

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
