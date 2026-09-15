import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getRelationFieldOrderBy } from 'src/modules/dashboard/chart-data/utils/get-relation-field-order-by.util';

const createMockFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'test-id',
    name: 'testField',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'test-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const createMockObjectMetadata = (
  overrides: Partial<FlatObjectMetadata>,
): FlatObjectMetadata =>
  ({
    id: 'test-object-id',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    fieldIds: [],
    universalIdentifier: 'test-object-universal-id',
    ...overrides,
  }) as FlatObjectMetadata;

const buildFlatEntityMaps = <
  TEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  entities: TEntity[],
): FlatEntityMaps<TEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier as string, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier as string]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('getRelationFieldOrderBy', () => {
  const companyNameField = createMockFieldMetadata({
    id: 'company-name-field-id',
    name: 'name',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'company-name-universal-id',
  });

  const companyObject = createMockObjectMetadata({
    id: 'company-object-id',
    nameSingular: 'company',
    namePlural: 'companies',
    labelIdentifierFieldMetadataId: companyNameField.id,
    universalIdentifier: 'company-object-universal-id',
  });

  const workspaceMemberNameField = createMockFieldMetadata({
    id: 'workspace-member-name-field-id',
    name: 'name',
    type: FieldMetadataType.FULL_NAME,
    universalIdentifier: 'workspace-member-name-universal-id',
  });

  const workspaceMemberObject = createMockObjectMetadata({
    id: 'workspace-member-object-id',
    nameSingular: 'workspaceMember',
    namePlural: 'workspaceMembers',
    labelIdentifierFieldMetadataId: workspaceMemberNameField.id,
    universalIdentifier: 'workspace-member-object-universal-id',
  });

  const flatObjectMetadataMaps = buildFlatEntityMaps([
    companyObject,
    workspaceMemberObject,
  ]);

  const flatFieldMetadataMaps = buildFlatEntityMaps([
    companyNameField,
    workspaceMemberNameField,
  ]);

  const relationFieldMetadata = createMockFieldMetadata({
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: companyObject.id,
  });

  describe('without subFieldName', () => {
    it('should order by the target label identifier then id for a TEXT label', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: null,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            name: OrderByDirection.AscNullsLast,
          },
        },
        {
          company: {
            id: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should order by firstName then lastName then id for a FULL_NAME label', () => {
      const workspaceMemberRelationField = createMockFieldMetadata({
        name: 'assignee',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: workspaceMemberObject.id,
      });

      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: workspaceMemberRelationField,
        groupBySubFieldName: null,
        direction: OrderByDirection.DescNullsLast,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          assignee: {
            name: {
              firstName: OrderByDirection.DescNullsLast,
            },
          },
        },
        {
          assignee: {
            name: {
              lastName: OrderByDirection.DescNullsLast,
            },
          },
        },
        {
          assignee: {
            id: OrderByDirection.DescNullsLast,
          },
        },
      ]);
    });

    it('should order by the target label identifier for a MORPH_RELATION field', () => {
      const morphRelationField = createMockFieldMetadata({
        name: 'owner',
        type: FieldMetadataType.MORPH_RELATION,
        relationTargetObjectMetadataId: companyObject.id,
      });

      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: morphRelationField,
        groupBySubFieldName: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          owner: {
            name: OrderByDirection.AscNullsLast,
          },
        },
        {
          owner: {
            id: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should fall back to id when the target has no label identifier', () => {
      const objectWithoutLabelIdentifier = createMockObjectMetadata({
        id: 'no-label-object-id',
        nameSingular: 'noLabel',
        namePlural: 'noLabels',
        labelIdentifierFieldMetadataId: null,
        universalIdentifier: 'no-label-object-universal-id',
      });

      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: createMockFieldMetadata({
          name: 'noLabel',
          relationTargetObjectMetadataId: objectWithoutLabelIdentifier.id,
        }),
        groupBySubFieldName: null,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: buildFlatEntityMaps([
          objectWithoutLabelIdentifier,
        ]),
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          noLabel: {
            id: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should fall back to id when the label identifier is the id field', () => {
      const idField = createMockFieldMetadata({
        id: 'id-field-id',
        name: 'id',
        type: FieldMetadataType.UUID,
        universalIdentifier: 'id-field-universal-id',
      });

      const objectWithIdLabel = createMockObjectMetadata({
        id: 'id-label-object-id',
        nameSingular: 'idLabel',
        namePlural: 'idLabels',
        labelIdentifierFieldMetadataId: idField.id,
        universalIdentifier: 'id-label-object-universal-id',
      });

      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: createMockFieldMetadata({
          name: 'idLabel',
          relationTargetObjectMetadataId: objectWithIdLabel.id,
        }),
        groupBySubFieldName: null,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: buildFlatEntityMaps([objectWithIdLabel]),
        flatFieldMetadataMaps: buildFlatEntityMaps([idField]),
      });

      expect(result).toEqual([
        {
          idLabel: {
            id: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should fall back to id when the label identifier type is unsupported', () => {
      const numberField = createMockFieldMetadata({
        id: 'number-field-id',
        name: 'amount',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'number-field-universal-id',
      });

      const objectWithNumberLabel = createMockObjectMetadata({
        id: 'number-label-object-id',
        nameSingular: 'numberLabel',
        namePlural: 'numberLabels',
        labelIdentifierFieldMetadataId: numberField.id,
        universalIdentifier: 'number-label-object-universal-id',
      });

      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: createMockFieldMetadata({
          name: 'numberLabel',
          relationTargetObjectMetadataId: objectWithNumberLabel.id,
        }),
        groupBySubFieldName: null,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: buildFlatEntityMaps([objectWithNumberLabel]),
        flatFieldMetadataMaps: buildFlatEntityMaps([numberField]),
      });

      expect(result).toEqual([
        {
          numberLabel: {
            id: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should fall back to id when the target object metadata is missing', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: createMockFieldMetadata({
          name: 'company',
          relationTargetObjectMetadataId: 'unknown-object-id',
        }),
        groupBySubFieldName: null,
        direction: OrderByDirection.DescNullsLast,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            id: OrderByDirection.DescNullsLast,
          },
        },
      ]);
    });
  });

  describe('with simple subFieldName', () => {
    it('should return nested object for simple subfield', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: 'name',
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            name: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should handle descending direction', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: 'name',
        direction: OrderByDirection.DescNullsLast,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            name: OrderByDirection.DescNullsLast,
          },
        },
      ]);
    });
  });

  describe('with composite subFieldName', () => {
    it('should return deeply nested object for composite subfield', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: 'address.addressCity',
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            address: {
              addressCity: OrderByDirection.AscNullsLast,
            },
          },
        },
      ]);
    });
  });

  describe('with date granularity', () => {
    it('should return date order by with granularity', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: 'createdAt',
        direction: OrderByDirection.AscNullsLast,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        isNestedDateField: true,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            createdAt: {
              orderBy: OrderByDirection.AscNullsLast,
              granularity: ObjectRecordGroupByDateGranularity.MONTH,
            },
          },
        },
      ]);
    });

    it('should use default granularity when isNestedDateField is true but granularity not provided', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: 'createdAt',
        direction: OrderByDirection.AscNullsLast,
        isNestedDateField: true,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            createdAt: {
              orderBy: OrderByDirection.AscNullsLast,
              granularity: ObjectRecordGroupByDateGranularity.DAY,
            },
          },
        },
      ]);
    });

    it('should return date order by when dateGranularity is provided', () => {
      const result = getRelationFieldOrderBy({
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: 'createdAt',
        direction: OrderByDirection.DescNullsLast,
        dateGranularity: ObjectRecordGroupByDateGranularity.YEAR,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            createdAt: {
              orderBy: OrderByDirection.DescNullsLast,
              granularity: ObjectRecordGroupByDateGranularity.YEAR,
            },
          },
        },
      ]);
    });
  });
});
