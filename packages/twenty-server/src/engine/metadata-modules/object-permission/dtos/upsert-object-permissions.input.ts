import { Field, InputType, Int } from '@nestjs/graphql';

import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertObjectPermissionsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  roleId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @Field(() => [ObjectPermissionInput])
  objectPermissions: ObjectPermissionInput[];
}

@InputType()
export class ObjectPermissionInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canReadObjectRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canUpdateObjectRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canSoftDeleteObjectRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canDestroyObjectRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  showInSidebar?: boolean;

  @IsInt()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  editWindowMinutes?: number | null;
}
