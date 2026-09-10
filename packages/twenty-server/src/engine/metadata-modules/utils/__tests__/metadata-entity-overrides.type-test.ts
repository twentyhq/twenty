import { type Equal, type Expect } from 'twenty-shared/testing';
import { type SerializedRelation } from 'twenty-shared/types';

import { type FieldMetadataOverrides } from 'src/engine/metadata-modules/field-metadata/types/field-metadata-overrides.type';
import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type ViewOverrides } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type ViewFieldOverrides } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // Nullability is the column's: label is not nullable, description is.
  Expect<Equal<FieldMetadataOverrides['label'], string | undefined>>,
  Expect<
    Equal<FieldMetadataOverrides['description'], string | null | undefined>
  >,
  Expect<
    Equal<
      NonNullable<
        NonNullable<FieldMetadataOverrides['translations']>['fr-FR']
      >['label'],
      string | undefined
    >
  >,

  // Foreign keys stored in the blob are serialized relations, nullable per column.
  Expect<
    Equal<
      ViewOverrides['calendarFieldMetadataId'],
      SerializedRelation | null | undefined
    >
  >,
  Expect<
    Equal<
      PageLayoutWidgetOverrides['pageLayoutTabId'],
      SerializedRelation | undefined
    >
  >,
  Expect<
    Equal<
      ObjectMetadataOverrides['imageIdentifierFieldMetadataId'],
      string | null | undefined
    >
  >,

  // Only translatable kinds carry translations.
  Expect<'translations' extends keyof ViewOverrides ? true : false>,
  Expect<'translations' extends keyof ViewFieldOverrides ? false : true>,

  Expect<
    Equal<
      keyof ObjectMetadataOverrides,
      | 'openRecordIn'
      | 'color'
      | 'description'
      | 'icon'
      | 'labelPlural'
      | 'labelSingular'
      | 'imageIdentifierFieldMetadataId'
      | 'translations'
    >
  >,
];
