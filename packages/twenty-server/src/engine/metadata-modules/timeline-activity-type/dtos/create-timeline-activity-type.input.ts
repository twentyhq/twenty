import { Field, InputType } from '@nestjs/graphql';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  TIMELINE_ACTIVITY_ACTIONS,
  type TimelineActivityAction,
} from 'twenty-shared/timeline';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateTimelineActivityTypeInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsIn(TIMELINE_ACTIVITY_ACTIONS)
  @IsOptional()
  @Field(() => String, { nullable: true })
  action?: TimelineActivityAction;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  targetRelationFieldMetadataId: string;
}
