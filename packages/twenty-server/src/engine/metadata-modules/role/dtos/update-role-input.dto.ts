import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateRolePayload {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  label?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canUpdateAllSettings?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canReadAllObjectRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canUpdateAllObjectRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canSoftDeleteAllObjectRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canDestroyAllObjectRecords?: boolean;
}

@InputType()
export class UpdateRoleInput {
  @Field(() => UpdateRolePayload)
  update: UpdateRolePayload;

  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the role to update',
  })
  @IsUUID()
  id!: string;
}
