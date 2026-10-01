import {
  FieldMetadataType,
  ViewCalendarLayout,
  ViewType,
} from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { validateFlatViewStartAndEndFields } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-start-and-end-fields.util';

describe('validateFlatViewStartAndEndFields', () => {
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
      startFieldMetadataUniversalIdentifier: 'calendar-field',
      endFieldMetadataUniversalIdentifier: null,
    } as UniversalFlatView;

    expect(
      validateFlatViewStartAndEndFields({
        flatView,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: { 'calendar-field': calendarField },
        },
      }),
    ).toEqual([]);
  });

  it('accepts a timeline view with a start field and no calendar layout', () => {
    const startField = {
      universalIdentifier: 'start-field',
      objectMetadataUniversalIdentifier: 'object',
      type: FieldMetadataType.DATE,
    } as UniversalFlatFieldMetadata;
    const flatView = {
      type: ViewType.TIMELINE,
      objectMetadataUniversalIdentifier: 'object',
      calendarLayout: null,
      startFieldMetadataUniversalIdentifier: 'start-field',
      endFieldMetadataUniversalIdentifier: null,
    } as UniversalFlatView;

    expect(
      validateFlatViewStartAndEndFields({
        flatView,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: { 'start-field': startField },
        },
      }),
    ).toEqual([]);
  });

  it('rejects a timeline view without a start field', () => {
    const flatView = {
      type: ViewType.TIMELINE,
      objectMetadataUniversalIdentifier: 'object',
      calendarLayout: null,
      startFieldMetadataUniversalIdentifier: null,
      endFieldMetadataUniversalIdentifier: null,
    } as UniversalFlatView;

    expect(
      validateFlatViewStartAndEndFields({
        flatView,
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toHaveLength(1);
  });

  it.each([
    {
      description: 'a non-date start field',
      startFieldType: FieldMetadataType.TEXT,
      endFieldUniversalIdentifier: null,
      endFieldType: FieldMetadataType.DATE,
      expectedMessage: 'Start date field must be a date or date time field',
    },
    {
      description: 'an end field equal to the start field',
      startFieldType: FieldMetadataType.DATE,
      endFieldUniversalIdentifier: 'start-field',
      endFieldType: FieldMetadataType.DATE,
      expectedMessage: 'Start and end date fields must be different',
    },
    {
      description: 'a missing end field',
      startFieldType: FieldMetadataType.DATE,
      endFieldUniversalIdentifier: 'unknown-field',
      endFieldType: FieldMetadataType.DATE,
      expectedMessage: 'End date field metadata not found',
    },
    {
      description: 'an end field of another date type',
      startFieldType: FieldMetadataType.DATE,
      endFieldUniversalIdentifier: 'end-field',
      endFieldType: FieldMetadataType.DATE_TIME,
      expectedMessage: 'Start and end date fields must have the same type',
    },
  ])(
    'rejects a timeline view with $description',
    ({
      startFieldType,
      endFieldUniversalIdentifier,
      endFieldType,
      expectedMessage,
    }) => {
      const startField = {
        universalIdentifier: 'start-field',
        objectMetadataUniversalIdentifier: 'object',
        type: startFieldType,
      } as UniversalFlatFieldMetadata;
      const endField = {
        universalIdentifier: 'end-field',
        objectMetadataUniversalIdentifier: 'object',
        type: endFieldType,
      } as UniversalFlatFieldMetadata;
      const flatView = {
        type: ViewType.TIMELINE,
        objectMetadataUniversalIdentifier: 'object',
        calendarLayout: null,
        startFieldMetadataUniversalIdentifier: 'start-field',
        endFieldMetadataUniversalIdentifier: endFieldUniversalIdentifier,
      } as UniversalFlatView;

      expect(
        validateFlatViewStartAndEndFields({
          flatView,
          flatFieldMetadataMaps: {
            byUniversalIdentifier: {
              'start-field': startField,
              'end-field': endField,
            },
          },
        }),
      ).toEqual([expect.objectContaining({ message: expectedMessage })]);
    },
  );
});
