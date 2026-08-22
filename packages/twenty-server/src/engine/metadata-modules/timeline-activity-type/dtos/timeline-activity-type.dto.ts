import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  // Explicit type: the action union is erased at runtime, so reflection cannot
  // infer a GraphQL type from it.
  @IsOptional()
  @Field(() => String, { nullable: true })
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
  @Field(() => UUIDScalarType, { nullable: true })
  objectUniversalIdentifier: string | null;

  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  targetRelationFieldUniversalIdentifier: string | null;

  @IsOptional()
  @Field(() => [UUIDScalarType], { nullable: true })
  triggerFieldUniversalIdentifiers: string[] | null;

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
