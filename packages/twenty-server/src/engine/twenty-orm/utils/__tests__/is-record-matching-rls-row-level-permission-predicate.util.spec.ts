import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';

describe('isRecordMatchingRLSRowLevelPermissionPredicate', () => {
  const createMockFlatObjectMetadata = (
    fieldIds: string[],
  ): FlatObjectMetadata => ({
    id: 'test-object-id',
    nameSingular: 'test',
    namePlural: 'tests',
    labelSingular: 'Test',
    labelPlural: 'Tests',
    icon: 'IconTest',
    color: null,
    targetTableName: 'test',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: false,
    isAuditLogged: false,
    isSearchable: false,
    workspaceId: 'test-workspace-id',
    universalIdentifier: 'test-object-id',
    indexMetadataIds: [],
    objectPermissionIds: [],
    fieldPermissionIds: [],
    fieldIds,
    viewIds: [],
    applicationId: 'test-application-id',
    isLabelSyncedWithName: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcut: null,
    description: null,
    standardOverrides: null,
    isUIReadOnly: false,
    labelIdentifierFieldMetadataId: null,
    imageIdentifierFieldMetadataId: null,
    duplicateCriteria: null,
    applicationUniversalIdentifier: 'test-application-id',
    fieldUniversalIdentifiers: fieldIds,
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    labelIdentifierFieldMetadataUniversalIdentifier: null,
    imageIdentifierFieldMetadataUniversalIdentifier: null,
  });

  const createMockFlatFieldMetadata = (
    id: string,
    name: string,
    type: FieldMetadataType,
    settings?: Record<string, unknown>,
  ): FlatFieldMetadata =>
    ({
      id,
      name,
      type,
      label: name,
      objectMetadataId: 'test-object-id',
      isLabelSyncedWithName: true,
      isNullable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: id,
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      mainGroupByFieldMetadataViewIds: [],
      applicationId: null,
      settings,
    }) as unknown as FlatFieldMetadata;

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byUniversalIdentifier: fields.reduce(
      (accumulator, field) => {
        accumulator[field.universalIdentifier] = field;

        return accumulator;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    universalIdentifierById: fields.reduce(
      (accumulator, field) => {
        accumulator[field.id] = field.universalIdentifier;

        return accumulator;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  const fieldMetadata = [
    createMockFlatFieldMetadata(
      'job-title-id',
      'jobTitle',
      FieldMetadataType.TEXT,
    ),
    createMockFlatFieldMetadata('name-id', 'name', FieldMetadataType.FULL_NAME),
    createMockFlatFieldMetadata(
      'address-id',
      'address',
      FieldMetadataType.ADDRESS,
    ),
    createMockFlatFieldMetadata(
      'company-id',
      'company',
      FieldMetadataType.RELATION,
      {
        joinColumnName: 'companyId',
      },
    ),
    createMockFlatFieldMetadata(
      'account-tags-id',
      'accountTags',
      FieldMetadataType.RELATION,
      {
        relationType: 'ONE_TO_MANY',
        junctionTargetFieldId: 'junction-target-field-id',
      },
    ),
  ];

  const flatObjectMetadata = createMockFlatObjectMetadata(
    fieldMetadata.map((field) => field.id),
  );
  const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fieldMetadata);

  const baseRecord: ObjectRecord = {
    jobTitle: 'Engineer',
    name: {
      firstName: 'Jane',
      lastName: 'Doe',
    },
    address: {
      addressStreet1: 'Main Street',
      addressCity: 'Paris',
    },
    companyId: 'company-1',
    deletedAt: null,
    id: 'record-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ObjectRecord;

  it('returns true for an empty filter on non-deleted record', () => {
    const result = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: baseRecord,
      filter: {},
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(true);
  });

  it('returns false for deleted records without deletedAt filter', () => {
    const result = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: { ...baseRecord, deletedAt: new Date().toISOString() },
      filter: {
        jobTitle: {
          eq: 'Engineer',
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });

  it('treats multiple filter keys as an implicit and', () => {
    const result = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: baseRecord,
      filter: {
        jobTitle: {
          eq: 'Engineer',
        },
        name: {
          firstName: {
            eq: 'Jane',
          },
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(true);
  });

  it('treats "or" with object as an "and"', () => {
    const matchingResult = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: baseRecord,
      filter: {
        or: {
          jobTitle: {
            eq: 'Engineer',
          },
          name: {
            lastName: {
              eq: 'Doe',
            },
          },
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    const nonMatchingResult = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: {
        ...baseRecord,
        name: {
          ...baseRecord.name,
          lastName: 'Smith',
        },
      },
      filter: {
        or: {
          jobTitle: {
            eq: 'Engineer',
          },
          name: {
            lastName: {
              eq: 'Doe',
            },
          },
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(matchingResult).toBe(true);
    expect(nonMatchingResult).toBe(false);
  });

  it('supports "not" filter negation', () => {
    const result = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: baseRecord,
      filter: {
        not: {
          jobTitle: {
            eq: 'Engineer',
          },
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });

  it('matches composite address filters using at least one sub-field', () => {
    const result = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: baseRecord,
      filter: {
        address: {
          addressStreet1: {
            eq: 'Main Street',
          },
          addressCity: {
            eq: 'London',
          },
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(true);
  });

  it('supports relation join column filters', () => {
    const result = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: baseRecord,
      filter: {
        companyId: {
          eq: 'company-1',
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(true);
  });

  // [STRATUM-PATCH] Regression tests for many-to-many (junction) RELATION
  // filters. Upstream twentyhq/twenty threw "Not implemented yet" whenever an
  // RLS predicate targeted a junction relation field (settings have
  // junctionTargetFieldId but no joinColumnName). See matching fix and tests
  // in packages/twenty-front/.../isRecordMatchingFilter.{ts,test.ts}.
  describe('Many-to-many RELATION (junction) filter', () => {
    const tagA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const tagB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const tagC = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

    it('matches a record whose junction array contains an id in the filter "some.in" list', () => {
      const result = isRecordMatchingRLSRowLevelPermissionPredicate({
        record: {
          ...baseRecord,
          accountTags: [{ id: tagA }, { id: tagB }],
        } as ObjectRecord,
        filter: { accountTags: { some: { in: [tagA] } } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toBe(true);
    });

    it('does not match when no junction-array id is in the filter "some.in" list', () => {
      const result = isRecordMatchingRLSRowLevelPermissionPredicate({
        record: {
          ...baseRecord,
          accountTags: [{ id: tagA }, { id: tagB }],
        } as ObjectRecord,
        filter: { accountTags: { some: { in: [tagC] } } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toBe(false);
    });

    it('does not match when the junction array is empty', () => {
      const result = isRecordMatchingRLSRowLevelPermissionPredicate({
        record: {
          ...baseRecord,
          accountTags: [],
        } as ObjectRecord,
        filter: { accountTags: { some: { in: [tagA] } } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toBe(false);
    });

    it('matches with a NOT wrapper when none of the junction ids are in the filter list', () => {
      const result = isRecordMatchingRLSRowLevelPermissionPredicate({
        record: {
          ...baseRecord,
          accountTags: [{ id: tagA }],
        } as ObjectRecord,
        filter: { not: { accountTags: { some: { in: [tagC] } } } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toBe(true);
    });

    it('does not match with a NOT wrapper when a junction id is in the filter list', () => {
      const result = isRecordMatchingRLSRowLevelPermissionPredicate({
        record: {
          ...baseRecord,
          accountTags: [{ id: tagA }],
        } as ObjectRecord,
        filter: { not: { accountTags: { some: { in: [tagA] } } } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toBe(false);
    });
  });
});
