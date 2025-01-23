import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

registerEnumType(RelationType, {
  name: 'RelationType',
  description: 'Relation type',
});

@ObjectType('Relation')
export class RelationDTO {
  @IsEnum(RelationType)
  @IsNotEmpty()
  @Field(() => RelationType)
  type: RelationType;

  @IsNotEmpty()
  @Field(() => ObjectMetadataEntity)
  sourceObjectMetadata: Relation<ObjectMetadataEntity>;

  @IsNotEmpty()
  @Field(() => ObjectMetadataEntity)
  targetObjectMetadata: Relation<ObjectMetadataEntity>;

  @IsNotEmpty()
  @Field(() => FieldMetadataEntity)
  sourceFieldMetadata: Relation<FieldMetadataEntity>;

  @IsNotEmpty()
  @Field(() => FieldMetadataEntity)
  targetFieldMetadata: Relation<FieldMetadataEntity>;
}
