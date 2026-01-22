import { CalendarStartDay } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildGroupByFieldObject } from 'src/modules/dashboard/chart-data/utils/build-group-by-field-object.util';

const createMockFieldMetadata = (overrides: Partial<FlatFieldMetadata>) =>
  ({
    id: 'test-id',
    name: 'testField',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'test-universal-id',
    description: null,
    ...overrides,
  }) as FlatFieldMetadata;

const userTimezone = 'Europe/Paris';

describe('buildGroupByFieldObject', () => {
  describe('relation fields', () => {
    it('should return field with Id suffix for relation fields without subFieldName', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({ fieldMetadata });

      expect(result).toEqual({ companyId: true });
    });

    it('should return nested object for relation field with subFieldName', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'name',
      });

      expect(result).toEqual({ company: { name: true } });
    });

    it('should return deeply nested object for relation with composite subfield', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'address.addressCity',
      });

      expect(result).toEqual({
        company: { address: { addressCity: true } },
      });
    });

    it('should return date granularity for relation date field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'createdAt',
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        isNestedDateField: true,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        company: {
          createdAt: {
            granularity: ObjectRecordGroupByDateGranularity.MONTH,
            timeZone: 'Europe/Paris',
          },
        },
      });
    });

    it('should throw error for nested date field without time zone when required', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      expect(() =>
        buildGroupByFieldObject({
          fieldMetadata,
          subFieldName: 'createdAt',
          dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
          isNestedDateField: true,
        }),
      ).toThrow('Date group by should have a time zone.');
    });

    it('should include weekStartDay for nested date field with WEEK granularity and MONDAY', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'createdAt',
        dateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
        firstDayOfTheWeek: CalendarStartDay.MONDAY,
        isNestedDateField: true,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        company: {
          createdAt: {
            granularity: ObjectRecordGroupByDateGranularity.WEEK,
            weekStartDay: 'MONDAY',
            timeZone: userTimezone,
          },
        },
      });
    });

    it('should include weekStartDay for nested date field with WEEK granularity and SUNDAY', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'createdAt',
        dateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        isNestedDateField: true,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        company: {
          createdAt: {
            granularity: ObjectRecordGroupByDateGranularity.WEEK,
            weekStartDay: 'SUNDAY',
            timeZone: userTimezone,
          },
        },
      });
    });

    it('should not include weekStartDay for nested date field with WEEK granularity and SYSTEM', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'createdAt',
        dateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
        firstDayOfTheWeek: CalendarStartDay.SYSTEM,
        isNestedDateField: true,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        company: {
          createdAt: {
            granularity: ObjectRecordGroupByDateGranularity.WEEK,
            timeZone: userTimezone,
          },
        },
      });
    });

    it('should not include weekStartDay for nested date field with non-WEEK granularity', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-object-id',
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'createdAt',
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        firstDayOfTheWeek: CalendarStartDay.MONDAY,
        isNestedDateField: true,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        company: {
          createdAt: {
            granularity: ObjectRecordGroupByDateGranularity.MONTH,
            timeZone: userTimezone,
          },
        },
      });
    });
  });

  describe('composite fields', () => {
    it('should return nested object for composite fields with subfield', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'firstName',
      });

      expect(result).toEqual({
        name: {
          firstName: true,
        },
      });
    });

    it('should throw error for composite field without subfield', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      });

      expect(() => buildGroupByFieldObject({ fieldMetadata })).toThrow(
        'Composite field name requires a subfield to be specified',
      );
    });

    it('should handle ADDRESS composite field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'address',
        type: FieldMetadataType.ADDRESS,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        subFieldName: 'addressCity',
      });

      expect(result).toEqual({
        address: {
          addressCity: true,
        },
      });
    });
  });

  describe('date fields', () => {
    it('should return field with default granularity for DATE field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        timeZone: 'Europe/Paris',
      });

      expect(result).toEqual({
        createdAt: {
          granularity: ObjectRecordGroupByDateGranularity.DAY,
          timeZone: 'Europe/Paris',
        },
      });
    });

    it('should return field with default granularity for DATE_TIME field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        timeZone: 'Europe/Paris',
      });

      expect(result).toEqual({
        updatedAt: {
          granularity: ObjectRecordGroupByDateGranularity.DAY,
          timeZone: 'Europe/Paris',
        },
      });
    });

    it('should return field with custom granularity for date field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        timeZone: 'Europe/Paris',
      });

      expect(result).toEqual({
        createdAt: {
          granularity: ObjectRecordGroupByDateGranularity.MONTH,
          timeZone: 'Europe/Paris',
        },
      });
    });

    it('should throw error for date field without time zone when required', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      expect(() =>
        buildGroupByFieldObject({
          fieldMetadata,
          dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        }),
      ).toThrow('Date group by should have a time zone.');
    });

    it('should include weekStartDay for WEEK granularity with MONDAY', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        dateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
        firstDayOfTheWeek: CalendarStartDay.MONDAY,
        timeZone: 'Europe/Paris',
      });

      expect(result).toEqual({
        createdAt: {
          granularity: ObjectRecordGroupByDateGranularity.WEEK,
          weekStartDay: 'MONDAY',
          timeZone: 'Europe/Paris',
        },
      });
    });

    it('should include weekStartDay for WEEK granularity with SUNDAY', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        dateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        createdAt: {
          granularity: ObjectRecordGroupByDateGranularity.WEEK,
          weekStartDay: 'SUNDAY',
          timeZone: userTimezone,
        },
      });
    });

    it('should not include weekStartDay for WEEK granularity with SYSTEM', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        dateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
        firstDayOfTheWeek: CalendarStartDay.SYSTEM,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        createdAt: {
          granularity: ObjectRecordGroupByDateGranularity.WEEK,
          timeZone: userTimezone,
        },
      });
    });

    it('should not include weekStartDay for non-WEEK granularity', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = buildGroupByFieldObject({
        fieldMetadata,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        firstDayOfTheWeek: CalendarStartDay.MONDAY,
        timeZone: userTimezone,
      });

      expect(result).toEqual({
        createdAt: {
          granularity: ObjectRecordGroupByDateGranularity.MONTH,
          timeZone: userTimezone,
        },
      });
    });
  });

  describe('regular fields', () => {
    it('should return simple field object for TEXT field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'status',
        type: FieldMetadataType.TEXT,
      });

      const result = buildGroupByFieldObject({ fieldMetadata });

      expect(result).toEqual({ status: true });
    });

    it('should return simple field object for SELECT field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'priority',
        type: FieldMetadataType.SELECT,
      });

      const result = buildGroupByFieldObject({ fieldMetadata });

      expect(result).toEqual({ priority: true });
    });

    it('should return simple field object for NUMBER field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'quantity',
        type: FieldMetadataType.NUMBER,
      });

      const result = buildGroupByFieldObject({ fieldMetadata });

      expect(result).toEqual({ quantity: true });
    });

    it('should return simple field object for BOOLEAN field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'isActive',
        type: FieldMetadataType.BOOLEAN,
      });

      const result = buildGroupByFieldObject({ fieldMetadata });

      expect(result).toEqual({ isActive: true });
    });
  });
});
