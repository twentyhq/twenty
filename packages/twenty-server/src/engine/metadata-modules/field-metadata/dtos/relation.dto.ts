import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

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
  @Field(() => ObjectMetadataDTO)
  sourceObjectMetadata: Relation<ObjectMetadataDTO>;

  @IsNotEmpty()
  @Field(() => ObjectMetadataDTO)
  targetObjectMetadata: Relation<ObjectMetadataDTO>;

  @IsNotEmpty()
  @Field(() => FieldMetadataDTO)
  sourceFieldMetadata: Relation<FieldMetadataDTO>;

  @IsNotEmpty()
  @Field(() => FieldMetadataDTO)
  targetFieldMetadata: Relation<FieldMetadataDTO>;
}
