import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineActivityTypeEmitDTO } from 'src/engine/metadata-modules/timeline-activity-type/dtos/timeline-activity-type-emit.dto';
import { type TimelineActivityTypeOverrides } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';

@ObjectType('TimelineActivityType')
export class TimelineActivityTypeDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  universalIdentifier: string;

  @IsNotEmpty()
  @Field()
  name: string;

  @IsNotEmpty()
  @Field()
  label: string;

  @IsOptional()
  @Field(() => TimelineActivityTypeEmitDTO, { nullable: true })
  emit: TimelineActivityTypeEmitDTO | null;

  @IsOptional()
  @Field(() => String, {
    nullable: true,
    deprecationReason: 'Use emit.on',
  })
  action: TimelineActivityAction | null;

  @IsOptional()
  @Field(() => String, { nullable: true })
  icon: string | null;

  @IsOptional()
  @Field(() => String, {
    nullable: true,
    deprecationReason: 'Use frontComponentUniversalIdentifier',
  })
  renderer: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  frontComponentUniversalIdentifier: string | null;

  @IsOptional()
  @Field(() => UUIDScalarType, {
    nullable: true,
    deprecationReason: 'Use emit.objectUniversalIdentifier',
  })
  objectUniversalIdentifier: string | null;

  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  replacesTimelineActivityTypeUniversalIdentifier: string | null;

  @IsBoolean()
  @Field()
  isActive: boolean;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @HideField()
  overrides: TimelineActivityTypeOverrides | null;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
