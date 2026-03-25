import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

@InputType()
export class UpdatePageLayoutInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => PageLayoutType, { nullable: true })
  @IsEnum(PageLayoutType)
  @IsOptional()
  type?: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId?: string | null;
}
