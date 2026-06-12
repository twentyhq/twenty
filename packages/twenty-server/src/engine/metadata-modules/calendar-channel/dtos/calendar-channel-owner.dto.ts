import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('CalendarChannelOwner')
export class CalendarChannelOwnerDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  calendarChannelId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId: string | null;
}
