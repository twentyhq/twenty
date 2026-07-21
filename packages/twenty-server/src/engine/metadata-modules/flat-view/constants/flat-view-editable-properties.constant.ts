import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VIEW_EDITABLE_PROPERTIES = [
  'name',
  'type',
  'icon',
  'position',
  'isCompact',
  'openRecordIn',
  'kanbanAggregateOperation',
  'kanbanAggregateOperationFieldMetadataId',
  'anyFieldFilterValue',
  'calendarLayout',
  'calendarFieldMetadataId',
  'calendarEndFieldMetadataId',
  'visibility',
  'mainGroupByFieldMetadataId',
  'shouldHideEmptyGroups',
  'kanbanColumnWidth',
] as const satisfies MetadataEntityPropertyName<'view'>[];
