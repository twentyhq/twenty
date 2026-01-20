import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('NavigationMenuItem')
export class NavigationMenuItemDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  forWorkspaceMemberId?: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  targetRecordId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  targetObjectMetadataId: string;

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
}
