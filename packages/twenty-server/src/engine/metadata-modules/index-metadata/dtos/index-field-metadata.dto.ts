import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrderByDirection } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

registerEnumType(OrderByDirection, {
  name: 'OrderByDirection',
  description: 'Sort direction, including where nulls go',
});

@ObjectType('IndexField')
export class IndexFieldMetadataDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  indexMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsNumber()
  @IsNotEmpty()
  @Field()
  order: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  subFieldName?: string;

  @IsOptional()
  @IsEnum(OrderByDirection)
  @Field(() => OrderByDirection, {
    nullable: true,
    description: 'Null means ascending with nulls last, the btree default',
  })
  direction?: OrderByDirection;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;

  @HideField()
  workspaceId: string;
}
