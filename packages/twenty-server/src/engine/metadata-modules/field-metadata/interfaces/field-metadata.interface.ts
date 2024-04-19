import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

@ObjectType()
export class FieldMetadataInterface<
  T extends FieldMetadataType | 'default' = 'default',
> {
  id: string;
  type: FieldMetadataType;
  name: string;
  label: string;

  @Field(() => GraphQLJSON, { nullable: true })
  defaultValue?: FieldMetadataDefaultValue<T>;

  @Field(() => [GraphQLJSON], { nullable: true })
  options?: FieldMetadataOptions<T>;

  @Field(() => String)
  objectMetadataId: string;

  @Field(() => String, { nullable: true })
  workspaceId?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isNullable?: boolean;

  @Field(() => RelationMetadataEntity, { nullable: true })
  fromRelationMetadata?: RelationMetadataEntity;

  @Field(() => RelationMetadataEntity, { nullable: true })
  toRelationMetadata?: RelationMetadataEntity;

  @Field(() => Boolean, { nullable: true })
  isCustom?: boolean;
}
