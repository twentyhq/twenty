import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { HasAllProperties, TSExpect } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

type DefinedRelationRecord = {
  relationTargetFieldMetadataId: string;
  relationTargetFieldMetadata: Relation<FieldMetadataEntity>;
  relationTargetObjectMetadataId: string;
  relationTargetObjectMetadata: Relation<ObjectMetadataEntity>;
};

type NoteDefinedRelationRecord = {
  relationTargetFieldMetadataId: never;
  relationTargetFieldMetadata: never;
  relationTargetObjectMetadataId: never;
  relationTargetObjectMetadata: never;
};

type Text = FieldMetadataEntity<FieldMetadataType.TEXT>;
type RelationFieldMetadata = FieldMetadataEntity<FieldMetadataType.RELATION>;
type MorphRelation = FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>;

type Assertions = [
  TSExpect<HasAllProperties<NoteDefinedRelationRecord, Text>>,

  TSExpect<HasAllProperties<DefinedRelationRecord, RelationFieldMetadata>>,
  TSExpect<HasAllProperties<DefinedRelationRecord, MorphRelation>>,
];
