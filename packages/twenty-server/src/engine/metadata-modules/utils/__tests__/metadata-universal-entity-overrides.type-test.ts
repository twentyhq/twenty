import { type Equal, type Expect } from 'twenty-shared/testing';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalEntityOverrides } from 'src/engine/metadata-modules/utils/metadata-universal-entity-overrides.type';
import { type JSONB_PROPERTY_BRAND } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// The universal flat entity types universalOverrides by running
// FormatRecordSerializedRelationProperties over the entity's overrides column.
// The registry-derived twin has to agree with it, otherwise a converter typed
// with the twin silently disagrees with the flat entity it reads from.
type UniversalOverridesOfFlatEntity<
  T extends 'view' | 'viewField' | 'pageLayoutWidget' | 'commandMenuItem',
> = Omit<
  NonNullable<MetadataUniversalFlatEntity<T>['universalOverrides']>,
  typeof JSONB_PROPERTY_BRAND
>;

type ViewTwin = MetadataUniversalEntityOverrides<'view'>;
type ViewFlatEntityOverrides = UniversalOverridesOfFlatEntity<'view'>;
type ViewFieldTwin = MetadataUniversalEntityOverrides<'viewField'>;
type ViewFieldFlatEntityOverrides = UniversalOverridesOfFlatEntity<'viewField'>;
type PageLayoutWidgetTwin =
  MetadataUniversalEntityOverrides<'pageLayoutWidget'>;
type PageLayoutWidgetFlatEntityOverrides =
  UniversalOverridesOfFlatEntity<'pageLayoutWidget'>;
type CommandMenuItemTwin = MetadataUniversalEntityOverrides<'commandMenuItem'>;
type CommandMenuItemFlatEntityOverrides =
  UniversalOverridesOfFlatEntity<'commandMenuItem'>;

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<Equal<keyof ViewTwin, keyof ViewFlatEntityOverrides>>,
  Expect<ViewTwin extends ViewFlatEntityOverrides ? true : false>,
  Expect<ViewFlatEntityOverrides extends ViewTwin ? true : false>,

  Expect<Equal<keyof ViewFieldTwin, keyof ViewFieldFlatEntityOverrides>>,
  Expect<ViewFieldTwin extends ViewFieldFlatEntityOverrides ? true : false>,
  Expect<ViewFieldFlatEntityOverrides extends ViewFieldTwin ? true : false>,

  Expect<
    Equal<keyof PageLayoutWidgetTwin, keyof PageLayoutWidgetFlatEntityOverrides>
  >,
  Expect<
    PageLayoutWidgetTwin extends PageLayoutWidgetFlatEntityOverrides
      ? true
      : false
  >,
  Expect<
    PageLayoutWidgetFlatEntityOverrides extends PageLayoutWidgetTwin
      ? true
      : false
  >,

  Expect<
    Equal<keyof CommandMenuItemTwin, keyof CommandMenuItemFlatEntityOverrides>
  >,
  Expect<
    CommandMenuItemTwin extends CommandMenuItemFlatEntityOverrides
      ? true
      : false
  >,
  Expect<
    CommandMenuItemFlatEntityOverrides extends CommandMenuItemTwin
      ? true
      : false
  >,

  Expect<
    Equal<
      keyof ViewTwin,
      | 'name'
      | 'type'
      | 'icon'
      | 'position'
      | 'isCompact'
      | 'openRecordIn'
      | 'kanbanAggregateOperation'
      | 'kanbanAggregateOperationFieldMetadataUniversalIdentifier'
      | 'anyFieldFilterValue'
      | 'calendarLayout'
      | 'calendarFieldMetadataUniversalIdentifier'
      | 'calendarEndFieldMetadataUniversalIdentifier'
      | 'visibility'
      | 'mainGroupByFieldMetadataUniversalIdentifier'
      | 'shouldHideEmptyGroups'
      | 'kanbanColumnWidth'
      | 'translations'
    >
  >,
];
