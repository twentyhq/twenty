import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
class UpdateViewFieldInputUpdates {
  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isVisible?: boolean;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  size?: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  position?: number;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations;
}

@InputType()
export class UpdateViewFieldInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view field to update',
  })
  id: string;

  @Type(() => UpdateViewFieldInputUpdates)
  @ValidateNested()
  @Field(() => UpdateViewFieldInputUpdates, {
    description: 'The view field to update',
  })
  update: UpdateViewFieldInputUpdates;
}
