import {
  FieldMetadataType,
  ViewCalendarLayout,
  ViewType,
} from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { validateFlatViewCalendarFields } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-calendar-fields.util';

describe('validateFlatViewCalendarFields', () => {
  it.each([
    [ViewCalendarLayout.DAY, FieldMetadataType.DATE],
    [ViewCalendarLayout.DAY, FieldMetadataType.DATE_TIME],
    [ViewCalendarLayout.WEEK, FieldMetadataType.DATE],
    [ViewCalendarLayout.WEEK, FieldMetadataType.DATE_TIME],
    [ViewCalendarLayout.MONTH, FieldMetadataType.DATE],
    [ViewCalendarLayout.MONTH, FieldMetadataType.DATE_TIME],
  ])('accepts a %s calendar widget with a %s field', (calendarLayout, type) => {
    const calendarField = {
      universalIdentifier: 'calendar-field',
      objectMetadataUniversalIdentifier: 'object',
      type,
    } as UniversalFlatFieldMetadata;
    const flatView = {
      type: ViewType.CALENDAR_WIDGET,
      objectMetadataUniversalIdentifier: 'object',
      calendarLayout,
      calendarFieldMetadataUniversalIdentifier: 'calendar-field',
      calendarEndFieldMetadataUniversalIdentifier: null,
    } as UniversalFlatView;

    expect(
      validateFlatViewCalendarFields({
        flatView,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: { 'calendar-field': calendarField },
        },
      }),
    ).toEqual([]);
  });
});
