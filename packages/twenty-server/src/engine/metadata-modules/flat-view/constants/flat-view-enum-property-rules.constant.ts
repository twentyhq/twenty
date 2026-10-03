import {
  AggregateOperations,
  ViewCalendarLayout,
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityEnumPropertyRules } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-entity-enum-properties.util';

export const FLAT_VIEW_ENUM_PROPERTY_RULES = {
  type: { enumObject: ViewType },
  key: { enumObject: ViewKey, isNullable: true },
  openRecordIn: { enumObject: ViewOpenRecordIn },
  kanbanAggregateOperation: {
    enumObject: AggregateOperations,
    isNullable: true,
  },
  calendarLayout: { enumObject: ViewCalendarLayout, isNullable: true },
  visibility: { enumObject: ViewVisibility },
} satisfies FlatEntityEnumPropertyRules<UniversalFlatView>;
