/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { MAX_RELATED_RECORD_PATH_FIELD_COUNT } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateRelatedRecordPathInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  sourceObjectMetadataId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_RELATED_RECORD_PATH_FIELD_COUNT)
  @IsUUID('all', { each: true })
  @Field(() => [UUIDScalarType])
  fieldMetadataIds: string[];
}
