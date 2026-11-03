import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { AggregateOperations, ConditionalDisplay } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateViewFieldInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: true })
  isVisible?: boolean;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true, defaultValue: 0 })
  size?: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  viewFieldGroupId?: string;

  @IsOptional()
  @IsObject()
  @Field(() => GraphQLJSON, { nullable: true })
  conditionalDisplay?: ConditionalDisplay | null;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
