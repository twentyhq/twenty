import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import {
  type TimelineActivityAction,
  type TimelineActivityRenderer,
} from 'twenty-shared/timeline';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('TimelineActivityType')
export class TimelineActivityTypeDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsNotEmpty()
  @Field()
  name: string;

  @IsNotEmpty()
  @Field()
  label: string;

  // Explicit type: the action union is erased at runtime, so reflection cannot
  // infer a GraphQL type from it.
  @IsOptional()
  @Field(() => String, { nullable: true })
  action: TimelineActivityAction | null;

  @IsOptional()
  @Field(() => String, { nullable: true })
  icon: string | null;

  // Explicit type for the same reason as action: the renderer union is erased.
  @IsOptional()
  @Field(() => String, { nullable: true })
  renderer: TimelineActivityRenderer | null;

  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  objectUniversalIdentifier: string | null;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
