/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RELATED_RECORD_PATH_MAX_FIELD_COUNT } from 'src/engine/metadata-modules/related-record-path/constants/related-record-path-max-field-count.constant';

@InputType()
export class CreateRelatedRecordPathInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  sourceObjectMetadataId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(RELATED_RECORD_PATH_MAX_FIELD_COUNT)
  @IsUUID('all', { each: true })
  @Field(() => [UUIDScalarType])
  fieldMetadataIds: string[];
}
