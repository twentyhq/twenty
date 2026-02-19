import { Field, InputType } from '@nestjs/graphql';

import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateNavigationMenuItemInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  userWorkspaceId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  targetRecordId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  targetObjectMetadataId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  viewId?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  name?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  link?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  folderId?: string;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  position?: number;
}
