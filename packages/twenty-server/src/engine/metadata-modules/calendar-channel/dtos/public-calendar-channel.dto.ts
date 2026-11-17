import { Field, ObjectType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CalendarChannelVisibility } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';

@ObjectType('PublicCalendarChannel')
export class PublicCalendarChannelDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsEnum(CalendarChannelVisibility)
  @IsNotEmpty()
  @Field(() => CalendarChannelVisibility)
  visibility: CalendarChannelVisibility;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  connectedAccountId: string;

  @Field(() => ConnectedAccountPublicDTO)
  connectedAccount: ConnectedAccountPublicDTO;
}
