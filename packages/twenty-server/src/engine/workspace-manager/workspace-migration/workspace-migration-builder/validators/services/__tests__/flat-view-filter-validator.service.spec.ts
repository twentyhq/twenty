import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { FlatViewFilterValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-filter-validator.service';

const VIEW_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000c1';
const FIELD_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000d1';
const VIEW_FILTER_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000e1';

const mapsFrom = (
  entities: { universalIdentifier: string; [key: string]: unknown }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildFlatViewFilter = ({
  operand,
  value,
  subFieldName = null,
}: {
  operand: ViewFilterOperand;
  value: unknown;
  subFieldName?: string | null;
}) => ({
  universalIdentifier: VIEW_FILTER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  viewFilterGroupUniversalIdentifier: null,
  relationTargetFieldMetadataUniversalIdentifier: null,
  operand,
  value,
  subFieldName,
});

const buildCreationArgs = ({
  fieldType,
  operand,
  value,
  subFieldName,
}: {
  fieldType: FieldMetadataType;
  operand: ViewFilterOperand;
  value: unknown;
  subFieldName?: string | null;
}) =>
  ({
    flatEntityToValidate: buildFlatViewFilter({ operand, value, subFieldName }),
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterMaps: mapsFrom([]),
      flatViewMaps: mapsFrom([
        { universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
      ]),
      flatFieldMetadataMaps: mapsFrom([
        {
          universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          type: fieldType,
          label: 'Expires At',
        },
      ]),
      flatViewFilterGroupMaps: mapsFrom([]),
    },
  }) as unknown as Parameters<
    FlatViewFilterValidatorService['validateFlatViewFilterCreation']
  >[0];

const buildUpdateArgs = ({
  fieldType,
  operand,
  flatEntityUpdate,
}: {
  fieldType: FieldMetadataType;
  operand: ViewFilterOperand;
  flatEntityUpdate: Record<string, unknown>;
}) =>
  ({
    universalIdentifier: VIEW_FILTER_UNIVERSAL_IDENTIFIER,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterMaps: mapsFrom([
        buildFlatViewFilter({ operand, value: 'NEXT_30_DAY' }),
      ]),
      flatFieldMetadataMaps: mapsFrom([
        {
          universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          type: fieldType,
          label: 'Expires At',
        },
      ]),
      flatViewFilterGroupMaps: mapsFrom([]),
    },
  }) as unknown as Parameters<
    FlatViewFilterValidatorService['validateFlatViewFilterUpdate']
  >[0];

describe('FlatViewFilterValidatorService', () => {
  let service: FlatViewFilterValidatorService;

  beforeEach(() => {
    service = new FlatViewFilterValidatorService();
  });

  describe('value validation on creation', () => {
    it('should accept a value still being filled in', () => {
      const result = service.validateFlatViewFilterCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.DATE,
          operand: ViewFilterOperand.IS_RELATIVE,
          value: '',
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('should not validate a value for an operand expecting none', () => {
      const result = service.validateFlatViewFilterCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.DATE,
          operand: ViewFilterOperand.IS_TODAY,
          value: 'anything',
        }),
      );

      expect(result.errors).toEqual([]);
    });
  });

  describe('value validation on update', () => {
    it('should reject an invalid value being written', () => {
      const result = service.validateFlatViewFilterUpdate(
        buildUpdateArgs({
          fieldType: FieldMetadataType.DATE,
          operand: ViewFilterOperand.IS_RELATIVE,
          flatEntityUpdate: {
            value: { direction: 'NEXT', amount: 30, unit: 'DAY' },
          },
        }),
      );

      expect(result.errors).toHaveLength(1);
    });

    it('should revalidate when the sub field changes the applicable schema', () => {
      const result = service.validateFlatViewFilterUpdate(
        buildUpdateArgs({
          fieldType: FieldMetadataType.CURRENCY,
          operand: ViewFilterOperand.IS,
          flatEntityUpdate: { subFieldName: 'currencyCode' },
        }),
      );

      expect(result.errors).toHaveLength(1);
    });

    it('should not validate the value when it is not part of the update', () => {
      const result = service.validateFlatViewFilterUpdate(
        buildUpdateArgs({
          fieldType: FieldMetadataType.DATE,
          operand: ViewFilterOperand.IS_RELATIVE,
          flatEntityUpdate: { positionInViewFilterGroup: 2 },
        }),
      );

      expect(result.errors).toEqual([]);
    });
  });
});
