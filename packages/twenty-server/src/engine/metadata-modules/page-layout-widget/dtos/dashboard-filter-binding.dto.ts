import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';
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

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  fieldMetadataId: SerializedRelation;
}
