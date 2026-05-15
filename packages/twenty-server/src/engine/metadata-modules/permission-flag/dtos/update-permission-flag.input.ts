import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdatePermissionFlagInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  label?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  iconKey?: string;
}

@InputType()
export class UpdatePermissionFlagInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the permission flag definition to update',
  })
  id: string;

  @Type(() => UpdatePermissionFlagInputUpdates)
  @ValidateNested()
  @Field(() => UpdatePermissionFlagInputUpdates, {
    description: 'The fields to update',
  })
  update: UpdatePermissionFlagInputUpdates;
}
