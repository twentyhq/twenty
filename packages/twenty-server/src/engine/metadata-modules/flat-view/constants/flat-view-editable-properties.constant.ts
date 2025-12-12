import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

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
  'visibility',
  'mainGroupByFieldMetadataId',
  'shouldHideEmptyGroups',
] as const satisfies (keyof FlatView)[];
