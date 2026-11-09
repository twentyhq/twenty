import { Field, ObjectType } from '@nestjs/graphql';

import { isNull } from '@sniptt/guards';
import { IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';
import {
  type DashboardFilterBinding,
  SerializedRelation,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DashboardFilterBinding')
export class DashboardFilterBindingDTO implements DashboardFilterBinding {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  pageLayoutFilterId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @ValidateIf((_, fieldMetadataId) => !isNull(fieldMetadataId))
  @IsUUID()
  fieldMetadataId: SerializedRelation | null;
}
