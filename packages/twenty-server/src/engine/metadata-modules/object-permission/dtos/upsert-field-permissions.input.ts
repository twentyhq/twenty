import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertFieldPermissionsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  roleId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @Field(() => [FieldPermissionInput])
  fieldPermissions: FieldPermissionInput[];
}

@InputType()
export class FieldPermissionInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canReadFieldValue?: boolean | null;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canUpdateFieldValue?: boolean | null;
}
