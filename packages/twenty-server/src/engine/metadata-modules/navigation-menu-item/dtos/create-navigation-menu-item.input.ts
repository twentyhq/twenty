import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateNavigationMenuItemInput {
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
  favoriteFolderId?: string;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  position?: number;
}
