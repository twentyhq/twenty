import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('TimelineActivityTypeEmitThrough')
export class TimelineActivityTypeEmitThroughDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  relationFieldUniversalIdentifier: string;

  @IsOptional()
  @Field(() => [UUIDScalarType], { nullable: true })
  triggerFieldUniversalIdentifiers: string[] | null;
}

@ObjectType('TimelineActivityTypeEmit')
export class TimelineActivityTypeEmitDTO {
  @IsNotEmpty()
  @Field(() => String)
  on: TimelineActivityAction;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  objectUniversalIdentifier: string | null;

  @IsOptional()
  @Field(() => TimelineActivityTypeEmitThroughDTO, { nullable: true })
  through: TimelineActivityTypeEmitThroughDTO | null;
}
