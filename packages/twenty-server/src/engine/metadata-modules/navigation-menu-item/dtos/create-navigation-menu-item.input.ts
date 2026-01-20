import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

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
  folderId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  position?: number;
}
