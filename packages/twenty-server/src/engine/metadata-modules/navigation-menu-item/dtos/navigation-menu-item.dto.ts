import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

import { RecordIdentifierDTO } from './record-identifier.dto';

@ObjectType('NavigationMenuItem')
export class NavigationMenuItemDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

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
  @Field(() => String, { nullable: true })
  name?: string | null;

  @IsOptional()
  @Field(() => String, { nullable: true })
  link?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  folderId?: string;

  @IsNumber()
  @IsNotEmpty()
  @Field()
  position: number;

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

  @Field(() => RecordIdentifierDTO, { nullable: true })
  targetRecordIdentifier?: RecordIdentifierDTO | null;
}
