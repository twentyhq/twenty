import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

@InputType()
export class CreatePageLayoutInput {
  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => PageLayoutType, {
    nullable: true,
    defaultValue: PageLayoutType.RECORD_PAGE,
  })
  @IsEnum(PageLayoutType)
  @IsOptional()
  type?: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId?: string | null;
}
