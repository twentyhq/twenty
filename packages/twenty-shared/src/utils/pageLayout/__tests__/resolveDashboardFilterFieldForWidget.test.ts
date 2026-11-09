import { FieldMetadataType, PageLayoutFilterType } from '@/types';
import { resolveDashboardFilterFieldForWidget } from '@/utils/pageLayout/resolveDashboardFilterFieldForWidget';

const PERIOD_FILTER_ID = 'period-filter-id';

const CREATED_AT_FIELD = {
  id: 'created-at-field-id',
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
};
const CLOSE_DATE_FIELD = {
  id: 'close-date-field-id',
  name: 'closeDate',
  type: FieldMetadataType.DATE,
};
const RENEWAL_DATE_FIELD = {
  id: 'renewal-date-field-id',
  name: 'renewalDate',
  type: FieldMetadataType.DATE,
};
const DEACTIVATED_DATE_FIELD = {
  id: 'deactivated-date-field-id',
  name: 'signatureDate',
  type: FieldMetadataType.DATE,
};
const DELETED_AT_FIELD = {
  id: 'deleted-at-field-id',
  name: 'deletedAt',
  type: FieldMetadataType.DATE_TIME,
};
const STAGE_FIELD = {
  id: 'stage-field-id',
  name: 'stage',
  type: FieldMetadataType.SELECT,
};

const FIELDS = [
  CREATED_AT_FIELD,
  CLOSE_DATE_FIELD,
  RENEWAL_DATE_FIELD,
  DEACTIVATED_DATE_FIELD,
  DELETED_AT_FIELD,
  STAGE_FIELD,
];

const resolve = ({
  bindings = null,
  groupByFieldMetadataIds = [],
  widgetFilterFieldMetadataIds = [],
  fields = FIELDS,
}: Partial<Parameters<typeof resolveDashboardFilterFieldForWidget>[0]>) =>
  resolveDashboardFilterFieldForWidget({
    pageLayoutFilterId: PERIOD_FILTER_ID,
    filterType: PageLayoutFilterType.DATE,
    bindings,
    groupByFieldMetadataIds,
    widgetFilterFieldMetadataIds,
    fields,
  });

describe('resolveDashboardFilterFieldForWidget', () => {
  it('should use the field a binding overrides the filter to, ahead of every inferred field', () => {
    expect(
      resolve({
        bindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataId: RENEWAL_DATE_FIELD.id,
          },
        ],
        groupByFieldMetadataIds: [CLOSE_DATE_FIELD.id],
      }),
    ).toEqual({ fieldMetadataId: RENEWAL_DATE_FIELD.id, source: 'OVERRIDE' });
  });

  it('should keep an override to a deactivated field', () => {
    expect(
      resolve({
        bindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataId: DEACTIVATED_DATE_FIELD.id,
          },
        ],
      }),
    ).toEqual({
      fieldMetadataId: DEACTIVATED_DATE_FIELD.id,
      source: 'OVERRIDE',
    });
  });

  it.each([
    ['a field of another object', 'field-of-another-object-id'],
    ['the soft-delete field', DELETED_AT_FIELD.id],
    ['a field that is not a date', STAGE_FIELD.id],
  ])(
    'should leave the filter unresolved when a binding overrides it to %s',
    (_title, fieldMetadataId) => {
      expect(
        resolve({
          bindings: [{ pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId }],
          groupByFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        }),
      ).toEqual({ fieldMetadataId: null, source: 'UNRESOLVED' });
    },
  );

  it('should not apply the filter when a binding excludes the widget from it', () => {
    expect(
      resolve({
        bindings: [
          { pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId: null },
        ],
        groupByFieldMetadataIds: [CLOSE_DATE_FIELD.id],
      }),
    ).toEqual({ fieldMetadataId: null, source: 'NOT_APPLIED' });
  });

  it('should ignore the bindings of other filters', () => {
    expect(
      resolve({
        bindings: [
          { pageLayoutFilterId: 'other-filter-id', fieldMetadataId: null },
        ],
      }),
    ).toEqual({ fieldMetadataId: CREATED_AT_FIELD.id, source: 'CREATED_AT' });
  });

  it('should infer the first date the widget groups by, ahead of a date it filters on', () => {
    expect(
      resolve({
        groupByFieldMetadataIds: [STAGE_FIELD.id, CLOSE_DATE_FIELD.id],
        widgetFilterFieldMetadataIds: [RENEWAL_DATE_FIELD.id],
      }),
    ).toEqual({ fieldMetadataId: CLOSE_DATE_FIELD.id, source: 'GROUP_BY' });
  });

  it('should infer the first date the widget filters on when it groups by no date', () => {
    expect(
      resolve({
        groupByFieldMetadataIds: [STAGE_FIELD.id],
        widgetFilterFieldMetadataIds: [STAGE_FIELD.id, RENEWAL_DATE_FIELD.id],
      }),
    ).toEqual({
      fieldMetadataId: RENEWAL_DATE_FIELD.id,
      source: 'WIDGET_FILTER',
    });
  });

  it('should fall back to createdAt when the widget neither groups by nor filters on a date', () => {
    expect(
      resolve({
        groupByFieldMetadataIds: [STAGE_FIELD.id],
        widgetFilterFieldMetadataIds: [STAGE_FIELD.id],
      }),
    ).toEqual({ fieldMetadataId: CREATED_AT_FIELD.id, source: 'CREATED_AT' });
  });

  it('should infer a deactivated field the widget still groups by or filters on', () => {
    expect(
      resolve({
        groupByFieldMetadataIds: [DEACTIVATED_DATE_FIELD.id],
      }),
    ).toEqual({
      fieldMetadataId: DEACTIVATED_DATE_FIELD.id,
      source: 'GROUP_BY',
    });
    expect(
      resolve({
        widgetFilterFieldMetadataIds: [DEACTIVATED_DATE_FIELD.id],
      }),
    ).toEqual({
      fieldMetadataId: DEACTIVATED_DATE_FIELD.id,
      source: 'WIDGET_FILTER',
    });
  });

  it('should never infer the soft-delete field', () => {
    expect(
      resolve({
        groupByFieldMetadataIds: [DELETED_AT_FIELD.id],
        widgetFilterFieldMetadataIds: [DELETED_AT_FIELD.id],
        fields: [DELETED_AT_FIELD, STAGE_FIELD],
      }),
    ).toEqual({ fieldMetadataId: null, source: 'UNRESOLVED' });
  });

  it('should skip ids that are not fields of the widget object', () => {
    expect(
      resolve({
        groupByFieldMetadataIds: ['field-of-another-object-id'],
        fields: [CLOSE_DATE_FIELD],
      }),
    ).toEqual({ fieldMetadataId: null, source: 'UNRESOLVED' });
  });
});
