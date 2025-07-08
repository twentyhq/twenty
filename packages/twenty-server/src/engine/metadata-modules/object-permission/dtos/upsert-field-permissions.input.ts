import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

@InputType()
export class UpsertFieldPermissionsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
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
  @Field()
  objectMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field()
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
