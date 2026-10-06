import {
  AggregateOperations,
  type DashboardFilterBindingsBySlotId,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateChartConfigurationFieldReferencesOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-chart-configuration-field-references.util';

const COMPANY_OBJECT_ID = '00000000-0000-4000-8000-000000000001';
const PERSON_OBJECT_ID = '00000000-0000-4000-8000-000000000002';

const COMPANY_EMPLOYEES_FIELD_ID = '11111111-0000-4000-8000-000000000001';
const COMPANY_CREATED_AT_FIELD_ID = '11111111-0000-4000-8000-000000000002';
const COMPANY_ADDRESS_FIELD_ID = '11111111-0000-4000-8000-000000000003';
const COMPANY_PEOPLE_FIELD_ID = '11111111-0000-4000-8000-000000000004';
const COMPANY_DEACTIVATED_FIELD_ID = '11111111-0000-4000-8000-000000000005';
const PERSON_CITY_FIELD_ID = '22222222-0000-4000-8000-000000000001';
const PERSON_CREATED_AT_FIELD_ID = '22222222-0000-4000-8000-000000000002';
const UNKNOWN_FIELD_ID = '99999999-0000-4000-8000-000000000001';

const buildFlatEntityMaps = <
  TFlatEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  buildFlatEntityMaps([
    getFlatObjectMetadataMock({
      id: COMPANY_OBJECT_ID,
      universalIdentifier: `${COMPANY_OBJECT_ID}-universal`,
    }),
    getFlatObjectMetadataMock({
      id: PERSON_OBJECT_ID,
      universalIdentifier: `${PERSON_OBJECT_ID}-universal`,
    }),
  ]);

const buildField = (
  overrides: Partial<FlatFieldMetadata> &
    Pick<FlatFieldMetadata, 'id' | 'objectMetadataId' | 'type'>,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: `${overrides.id}-universal`,
    ...overrides,
  });

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  buildFlatEntityMaps([
    buildField({
      id: COMPANY_EMPLOYEES_FIELD_ID,
      objectMetadataId: COMPANY_OBJECT_ID,
      type: FieldMetadataType.NUMBER,
    }),
    buildField({
      id: COMPANY_CREATED_AT_FIELD_ID,
      objectMetadataId: COMPANY_OBJECT_ID,
      type: FieldMetadataType.DATE_TIME,
    }),
    buildField({
      id: COMPANY_ADDRESS_FIELD_ID,
      objectMetadataId: COMPANY_OBJECT_ID,
      type: FieldMetadataType.ADDRESS,
    }),
    buildField({
      id: COMPANY_PEOPLE_FIELD_ID,
      objectMetadataId: COMPANY_OBJECT_ID,
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: PERSON_OBJECT_ID,
    }),
    buildField({
      id: COMPANY_DEACTIVATED_FIELD_ID,
      objectMetadataId: COMPANY_OBJECT_ID,
      type: FieldMetadataType.TEXT,
      isActive: false,
    }),
    buildField({
      id: PERSON_CITY_FIELD_ID,
      objectMetadataId: PERSON_OBJECT_ID,
      type: FieldMetadataType.TEXT,
    }),
    buildField({
      id: PERSON_CREATED_AT_FIELD_ID,
      objectMetadataId: PERSON_OBJECT_ID,
      type: FieldMetadataType.DATE_TIME,
    }),
  ]);

const validateCompanyAggregateChart = (
  dashboardFilterBindings: DashboardFilterBindingsBySlotId,
) =>
  validateChartConfigurationFieldReferencesOrThrow({
    widgetConfiguration: {
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: COMPANY_EMPLOYEES_FIELD_ID,
      aggregateOperation: AggregateOperations.SUM,
      dashboardFilterBindings,
    },
    widgetObjectMetadataId: COMPANY_OBJECT_ID,
    widgetTitle: 'Employees',
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

describe('validateChartConfigurationFieldReferencesOrThrow', () => {
  describe('dashboardFilterBindings', () => {
    it('should accept a binding to an active field of the chart object', () => {
      expect(() =>
        validateCompanyAggregateChart({
          date: { fieldMetadataId: COMPANY_CREATED_AT_FIELD_ID },
        }),
      ).not.toThrow();
    });

    it('should accept a null binding, which means the slot is not applied', () => {
      expect(() => validateCompanyAggregateChart({ date: null })).not.toThrow();
    });

    it('should accept a binding traversing a relation to an active field of the target object', () => {
      expect(() =>
        validateCompanyAggregateChart({
          date: {
            fieldMetadataId: COMPANY_PEOPLE_FIELD_ID,
            relationTargetFieldMetadataId: PERSON_CREATED_AT_FIELD_ID,
          },
        }),
      ).not.toThrow();
    });

    it('should accept a composite sub field that exists on the bound field', () => {
      expect(() =>
        validateCompanyAggregateChart({
          city: {
            fieldMetadataId: COMPANY_ADDRESS_FIELD_ID,
            subFieldName: 'addressCity',
          },
        }),
      ).not.toThrow();
    });

    it('should reject a binding to an unknown field', () => {
      expect(() =>
        validateCompanyAggregateChart({
          date: { fieldMetadataId: UNKNOWN_FIELD_ID },
        }),
      ).toThrow(
        new PageLayoutWidgetException(
          `Chart "Employees": Dashboard filter "date" binding uses field id "${UNKNOWN_FIELD_ID}", but it was deleted. Please remove or replace this binding.`,
          PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        ),
      );
    });

    it('should reject a binding to a deactivated field', () => {
      expect(() =>
        validateCompanyAggregateChart({
          text: { fieldMetadataId: COMPANY_DEACTIVATED_FIELD_ID },
        }),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should reject a binding to a field of another object', () => {
      expect(() =>
        validateCompanyAggregateChart({
          date: { fieldMetadataId: PERSON_CREATED_AT_FIELD_ID },
        }),
      ).toThrow(
        `Dashboard filter "date" binding field "${PERSON_CREATED_AT_FIELD_ID}" must belong to objectMetadataId "${COMPANY_OBJECT_ID}".`,
      );
    });

    it('should reject a relation target on a field that is not a relation', () => {
      expect(() =>
        validateCompanyAggregateChart({
          date: {
            fieldMetadataId: COMPANY_CREATED_AT_FIELD_ID,
            relationTargetFieldMetadataId: PERSON_CREATED_AT_FIELD_ID,
          },
        }),
      ).toThrow(
        `Dashboard filter "date" binding field "${COMPANY_CREATED_AT_FIELD_ID}" is not a relation, so it cannot target field "${PERSON_CREATED_AT_FIELD_ID}".`,
      );
    });

    it('should reject a relation target field that belongs to another object than the relation target', () => {
      expect(() =>
        validateCompanyAggregateChart({
          date: {
            fieldMetadataId: COMPANY_PEOPLE_FIELD_ID,
            relationTargetFieldMetadataId: COMPANY_CREATED_AT_FIELD_ID,
          },
        }),
      ).toThrow(
        `Dashboard filter "date" binding relation target field "${COMPANY_CREATED_AT_FIELD_ID}" must belong to objectMetadataId "${PERSON_OBJECT_ID}".`,
      );
    });

    it('should reject a sub field that does not exist on the bound field', () => {
      expect(() =>
        validateCompanyAggregateChart({
          city: {
            fieldMetadataId: COMPANY_ADDRESS_FIELD_ID,
            subFieldName: 'primaryLinkUrl',
          },
        }),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should reject a sub field on a non-composite field', () => {
      expect(() =>
        validateCompanyAggregateChart({
          date: {
            fieldMetadataId: COMPANY_CREATED_AT_FIELD_ID,
            subFieldName: 'addressCity',
          },
        }),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should validate the sub field against the relation target field when traversing a relation', () => {
      expect(() =>
        validateCompanyAggregateChart({
          city: {
            fieldMetadataId: COMPANY_PEOPLE_FIELD_ID,
            relationTargetFieldMetadataId: PERSON_CITY_FIELD_ID,
            subFieldName: 'addressCity',
          },
        }),
      ).toThrow(PageLayoutWidgetException);
    });
  });
});
