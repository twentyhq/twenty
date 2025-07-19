import { Expect, HasAllProperties } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation as TypeOrmRelation } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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

type UUIDFieldMetadata = FieldMetadataEntity<FieldMetadataType.UUID>;

type TextFieldMetadata = FieldMetadataEntity<FieldMetadataType.TEXT>;

type NumberFieldMetadata = FieldMetadataEntity<FieldMetadataType.NUMBER>;

type BooleanFieldMetadata = FieldMetadataEntity<FieldMetadataType.BOOLEAN>;

type DateFieldMetadata = FieldMetadataEntity<FieldMetadataType.DATE>;

type DateTimeFieldMetadata = FieldMetadataEntity<FieldMetadataType.DATE_TIME>;

type CurrencyFieldMetadata = FieldMetadataEntity<FieldMetadataType.CURRENCY>;

type FullNameFieldMetadata = FieldMetadataEntity<FieldMetadataType.FULL_NAME>;

type RatingFieldMetadata = FieldMetadataEntity<FieldMetadataType.RATING>;

type SelectFieldMetadata = FieldMetadataEntity<FieldMetadataType.SELECT>;

type MultiSelectFieldMetadata =
  FieldMetadataEntity<FieldMetadataType.MULTI_SELECT>;

type PositionFieldMetadata = FieldMetadataEntity<FieldMetadataType.POSITION>;

type RawJsonFieldMetadata = FieldMetadataEntity<FieldMetadataType.RAW_JSON>;

type RichTextFieldMetadata = FieldMetadataEntity<FieldMetadataType.RICH_TEXT>;

type ActorFieldMetadata = FieldMetadataEntity<FieldMetadataType.ACTOR>;

type ArrayFieldMetadata = FieldMetadataEntity<FieldMetadataType.ARRAY>;

type PhonesFieldMetadata = FieldMetadataEntity<FieldMetadataType.PHONES>;

type EmailsFieldMetadata = FieldMetadataEntity<FieldMetadataType.EMAILS>;

type LinksFieldMetadata = FieldMetadataEntity<FieldMetadataType.LINKS>;

type RelationFieldMetadata = FieldMetadataEntity<FieldMetadataType.RELATION>;

type MorphRelationFieldMetadata =
  FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>;

// eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
type Assertions = [
  Expect<HasAllProperties<UUIDFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<TextFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<NumberFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<BooleanFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<DateFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<DateTimeFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<CurrencyFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<FullNameFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RatingFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<SelectFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<MultiSelectFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<PositionFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RawJsonFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<RichTextFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<ActorFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<ArrayFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<PhonesFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<EmailsFieldMetadata, NotDefinedRelationRecord>>,
  Expect<HasAllProperties<LinksFieldMetadata, NotDefinedRelationRecord>>,

  Expect<HasAllProperties<RelationFieldMetadata, DefinedRelationRecord>>,
  Expect<HasAllProperties<MorphRelationFieldMetadata, DefinedRelationRecord>>,
];
