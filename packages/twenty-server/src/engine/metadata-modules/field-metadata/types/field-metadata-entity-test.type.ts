import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { Expect, HasAllProperties } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation as TypeOrmRelation } from 'typeorm';

type DefinedRelationRecord = {
  relationTargetFieldMetadataId: string;
  relationTargetFieldMetadata: TypeOrmRelation<FieldMetadataEntity>;
  relationTargetObjectMetadataId: string;
  relationTargetObjectMetadata: TypeOrmRelation<ObjectMetadataEntity>;
};

type NotDefinedRelationRecord = {
  relationTargetFieldMetadataId: never;
  relationTargetFieldMetadata: never;
  relationTargetObjectMetadataId: never;
  relationTargetObjectMetadata: never;
};

type UUID = FieldMetadataEntity<FieldMetadataType.UUID>;
type Text = FieldMetadataEntity<FieldMetadataType.TEXT>;
type Number = FieldMetadataEntity<FieldMetadataType.NUMBER>;
type Boolean = FieldMetadataEntity<FieldMetadataType.BOOLEAN>;
type Date = FieldMetadataEntity<FieldMetadataType.DATE>;
type DateTime = FieldMetadataEntity<FieldMetadataType.DATE_TIME>;
type Currency = FieldMetadataEntity<FieldMetadataType.CURRENCY>;
type FullName = FieldMetadataEntity<FieldMetadataType.FULL_NAME>;
type Rating = FieldMetadataEntity<FieldMetadataType.RATING>;
type Select = FieldMetadataEntity<FieldMetadataType.SELECT>;
type MultiSelect = FieldMetadataEntity<FieldMetadataType.MULTI_SELECT>;
type Position = FieldMetadataEntity<FieldMetadataType.POSITION>;
type RawJson = FieldMetadataEntity<FieldMetadataType.RAW_JSON>;
type RichText = FieldMetadataEntity<FieldMetadataType.RICH_TEXT>;
type Actor = FieldMetadataEntity<FieldMetadataType.ACTOR>;
type Array = FieldMetadataEntity<FieldMetadataType.ARRAY>;
type Phones = FieldMetadataEntity<FieldMetadataType.PHONES>;
type Emails = FieldMetadataEntity<FieldMetadataType.EMAILS>;
type Links = FieldMetadataEntity<FieldMetadataType.LINKS>;
type Relation = FieldMetadataEntity<FieldMetadataType.RELATION>;
type MorphRelation = FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>;

type Assertions = [
  Expect<HasAllProperties<Text, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Number, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Boolean, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Date, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<DateTime, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Currency, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<FullName, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Rating, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Select, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<MultiSelect, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Position, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RawJson, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RichText, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Actor, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Array, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Phones, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Emails, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<Links, NotDefinedRelationRecord>>,

  Expect<HasAllProperties<Relation, DefinedRelationRecord>>,
  Expect<HasAllProperties<MorphRelation, DefinedRelationRecord>>,
];
