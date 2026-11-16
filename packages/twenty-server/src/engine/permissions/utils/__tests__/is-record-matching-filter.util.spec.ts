import {
  FieldMetadataType,
  ObjectOpenRecordIn,
  RelationType,
  type ObjectRecord,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatFieldMetadataOptionMock } from 'src/engine/metadata-modules/flat-field-metadata-option/__mocks__/get-flat-field-metadata-option.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/permissions/internal/rls/constants/unsatisfiable-record-filter.constant';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

describe('isRecordMatchingFilter', () => {
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
    isRemote: false,
    isActive: true,
    isSystem: false,
    isAuditLogged: false,
    isSearchable: false,
    workspaceId: 'test-workspace-id',
    universalIdentifier: 'test-object-id',
    indexMetadataIds: [],
    searchFieldMetadataIds: [],
    navigationMenuItemIds: [],
    commandMenuItemIds: [],
    objectPermissionIds: [],
    fieldPermissionIds: [],
    rowLevelPermissionRuleIds: [],
    fieldIds,
    viewIds: [],
    pageLayoutIds: [],
    applicationId: 'test-application-id',
    isLabelSyncedWithName: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcut: null,
    description: null,
    overrides: null,
    isUIEditable: true,
    isUICreatable: true,
    disabledObjectPermissionActions: null,
    openRecordIn: ObjectOpenRecordIn.USER_CHOICE,
    labelIdentifierFieldMetadataId: null,
    imageIdentifierFieldMetadataId: null,
    duplicateCriteria: null,
    applicationUniversalIdentifier: 'test-application-id',
    fieldUniversalIdentifiers: fieldIds,
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    rowLevelPermissionRuleUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    pageLayoutUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
    navigationMenuItemUniversalIdentifiers: [],
    commandMenuItemUniversalIdentifiers: [],
    labelIdentifierFieldMetadataUniversalIdentifier: null,
    imageIdentifierFieldMetadataUniversalIdentifier: null,
  });

  const createMockFlatFieldMetadata = (
    id: string,
    name: string,
    type: FieldMetadataType,
    settings: FlatFieldMetadata['settings'] = null,
  ): FlatFieldMetadata =>
    getFlatFieldMetadataMock({
      id,
      name,
      type,
      label: name,
      objectMetadataId: 'test-object-id',
      universalIdentifier: id,
      settings,
    });

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
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'companyId',
      },
    ),
    createMockFlatFieldMetadata('users-id', 'users', FieldMetadataType.ARRAY),
    createMockFlatFieldMetadata(
      'created-by-id',
      'createdBy',
      FieldMetadataType.ACTOR,
    ),
    createMockFlatFieldMetadata(
      'emails-id',
      'emails',
      FieldMetadataType.EMAILS,
    ),
  ];

  const flatObjectMetadata = createMockFlatObjectMetadata(
    fieldMetadata.map((field) => field.id),
  );
  const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fieldMetadata);
  const flatFieldMetadataOptionMaps = createEmptyFlatEntityMaps();

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
    users: ['user-1', 'user-2'],
    createdBy: {
      source: 'MANUAL',
      name: 'Jane Doe',
      workspaceMemberId: 'member-1',
    },
    emails: {
      primaryEmail: 'jane@acme.com',
      additionalEmails: ['jane.doe@acme.com'],
    },
    deletedAt: null,
    id: 'record-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ObjectRecord;

  it('returns true for an empty filter on non-deleted record', () => {
    const result = isRecordMatchingFilter({
      record: baseRecord,
      filter: {},
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    });

    expect(result).toBe(true);
  });

  it('never matches the unsatisfiable filter', () => {
    const result = isRecordMatchingFilter({
      record: baseRecord,
      filter: UNSATISFIABLE_RECORD_FILTER,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    });

    expect(result).toBe(false);
  });

  it('returns false for deleted records without deletedAt filter', () => {
    const result = isRecordMatchingFilter({
      record: { ...baseRecord, deletedAt: new Date().toISOString() },
      filter: {
        jobTitle: {
          eq: 'Engineer',
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    });

    expect(result).toBe(false);
  });

  it('treats multiple filter keys as an implicit and', () => {
    const result = isRecordMatchingFilter({
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
      flatFieldMetadataOptionMaps,
    });

    expect(result).toBe(true);
  });

  it('treats "or" with object as an "and"', () => {
    const matchingResult = isRecordMatchingFilter({
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
      flatFieldMetadataOptionMaps,
    });

    const nonMatchingResult = isRecordMatchingFilter({
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
      flatFieldMetadataOptionMaps,
    });

    expect(matchingResult).toBe(true);
    expect(nonMatchingResult).toBe(false);
  });

  it('supports "not" filter negation', () => {
    const result = isRecordMatchingFilter({
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
      flatFieldMetadataOptionMaps,
    });

    expect(result).toBe(false);
  });

  it.each([
    [{ not: { jobTitle: { eq: 'Engineer' } } }, false],
    [{ not: { jobTitle: { is: 'NULL' } } }, false],
    [
      {
        or: [
          { jobTitle: { eq: 'Engineer' } },
          { companyId: { eq: 'company-1' } },
        ],
      },
      true,
    ],
  ] as [RecordGqlOperationFilter, boolean][])(
    'keeps a comparison with a null value unknown under "not", as SQL does (%j)',
    (filter, expected) => {
      expect(
        isRecordMatchingFilter({
          record: { ...baseRecord, jobTitle: null },
          filter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatFieldMetadataOptionMaps,
        }),
      ).toBe(expected);
    },
  );

  it.each([
    ['London', false],
    ['Paris', true],
  ])(
    'requires every composite sub-field to match, as SQL does (city %s)',
    (addressCity, expected) => {
      expect(
        isRecordMatchingFilter({
          record: baseRecord,
          filter: {
            address: {
              addressStreet1: { eq: 'Main Street' },
              addressCity: { eq: addressCity },
            },
          },
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatFieldMetadataOptionMaps,
        }),
      ).toBe(expected);
    },
  );

  it('never matches a composite sub-field it cannot read', () => {
    expect(
      isRecordMatchingFilter({
        record: baseRecord,
        filter: {
          address: {
            addressCity: { eq: 'Paris' },
            addressPlanet: { eq: 'Earth' },
          },
        } as RecordGqlOperationFilter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(false);
  });

  it.each([
    ['the creator', 'member-1', true],
    ['another member', 'member-2', false],
  ])(
    'matches an actor on its workspace member, for %s',
    (_, workspaceMemberId, expected) => {
      expect(
        isRecordMatchingFilter({
          record: baseRecord,
          filter: {
            createdBy: { workspaceMemberId: { eq: workspaceMemberId } },
          },
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatFieldMetadataOptionMaps,
        }),
      ).toBe(expected);
    },
  );

  it('treats a null actor source as no constraint', () => {
    expect(
      isRecordMatchingFilter({
        record: baseRecord,
        filter: {
          createdBy: { source: null, name: { eq: 'Jane Doe' } },
        } as RecordGqlOperationFilter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(true);
  });

  it.each([
    ['%jane.doe%', true],
    ['%john%', false],
  ])('matches additional emails like %s', (like, expected) => {
    expect(
      isRecordMatchingFilter({
        record: baseRecord,
        filter: { emails: { additionalEmails: { like } } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(expected);
  });

  it('never lets a null JSON sub-field match a like pattern', () => {
    expect(
      isRecordMatchingFilter({
        record: {
          ...baseRecord,
          emails: { primaryEmail: 'jane@acme.com', additionalEmails: null },
        },
        filter: { emails: { additionalEmails: { like: '%null%' } } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(false);
  });

  it('matches address coordinates', () => {
    expect(
      isRecordMatchingFilter({
        record: {
          ...baseRecord,
          address: { ...baseRecord.address, addressLat: 48.85 },
        },
        filter: {
          address: { addressLat: { gte: 48 } },
        } as RecordGqlOperationFilter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(true);
  });

  it('treats null and empty sub-field filters as no constraint', () => {
    expect(
      isRecordMatchingFilter({
        record: baseRecord,
        filter: {
          name: { firstName: null, lastName: { eq: 'Doe' } },
          address: { addressLat: {}, addressCity: { eq: 'Paris' } },
        } as RecordGqlOperationFilter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(true);
  });

  it.each([
    ['createdBy', { context: { is: 'NULL' } }, true],
    ['createdBy', { context: { is: 'NOT_NULL' } }, false],
    ['address', { addressLat: { is: 'NULL' } }, true],
    ['address', { addressCity: { eq: 'Paris' } }, false],
    ['name', { firstName: { is: 'NULL' } }, true],
  ])(
    'reads a null %s as null sub-fields for %j',
    (fieldName, subFieldFilter, expected) => {
      expect(
        isRecordMatchingFilter({
          record: { ...baseRecord, [fieldName]: null },
          filter: { [fieldName]: subFieldFilter } as RecordGqlOperationFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatFieldMetadataOptionMaps,
        }),
      ).toBe(expected);
    },
  );

  it('supports relation join column filters', () => {
    const result = isRecordMatchingFilter({
      record: baseRecord,
      filter: {
        companyId: {
          eq: 'company-1',
        },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    });

    expect(result).toBe(true);
  });

  it('matches "is not empty" on a relation field by its related record id', () => {
    expect(
      isRecordMatchingFilter({
        record: { ...baseRecord, company: { id: 'company-1' } } as ObjectRecord,
        filter: { company: { is: 'NOT_NULL' } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(true);

    expect(
      isRecordMatchingFilter({
        record: { ...baseRecord, company: null } as ObjectRecord,
        filter: { company: { is: 'NOT_NULL' } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(false);
  });

  it('matches "is empty" on a relation field by its related record id', () => {
    expect(
      isRecordMatchingFilter({
        record: { ...baseRecord, company: null } as ObjectRecord,
        filter: { company: { is: 'NULL' } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(true);

    expect(
      isRecordMatchingFilter({
        record: { ...baseRecord, company: { id: 'company-1' } } as ObjectRecord,
        filter: { company: { is: 'NULL' } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ).toBe(false);
  });

  it.each<{ filter: RecordGqlOperationFilter; expected: boolean }>([
    {
      filter: { users: { containsIlike: '%user-1%' } },
      expected: true,
    },
    {
      filter: { users: { containsIlike: '%user-999%' } },
      expected: false,
    },
    {
      filter: {
        or: [
          { users: { containsIlike: '%user-999%' } },
          { users: { containsIlike: '%user-1%' } },
        ],
      },
      expected: true,
    },
    {
      filter: {
        or: [
          { users: { containsIlike: '%user-999%' } },
          { users: { containsIlike: '%user-998%' } },
        ],
      },
      expected: false,
    },
    {
      filter: { not: { users: { containsIlike: '%user-1%' } } },
      expected: false,
    },
    {
      filter: { not: { users: { containsIlike: '%user-999%' } } },
      expected: true,
    },
  ])(
    'evaluates array RLS filter $filter as $expected',
    ({ filter, expected }) => {
      expect(
        isRecordMatchingFilter({
          record: baseRecord,
          filter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatFieldMetadataOptionMaps,
        }),
      ).toBe(expected);
    },
  );

  it('orders select values by the option rows rather than the stored options', () => {
    const priorityField: FlatFieldMetadata = {
      ...createMockFlatFieldMetadata(
        'priority-id',
        'priority',
        FieldMetadataType.SELECT,
      ),
      options: [
        { id: 'HIGH-option-id', value: 'HIGH', label: 'HIGH', position: 0 },
        { id: 'LOW-option-id', value: 'LOW', label: 'LOW', position: 1 },
      ],
      fieldMetadataOptionUniversalIdentifiers: [
        'LOW-option-id',
        'HIGH-option-id',
      ],
    };
    const evaluationArgs = {
      record: { ...baseRecord, priority: 'HIGH' },
      filter: { priority: { gt: 'LOW' } },
      flatObjectMetadata: createMockFlatObjectMetadata([priorityField.id]),
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps([priorityField]),
    };

    expect(
      isRecordMatchingFilter({
        ...evaluationArgs,
        flatFieldMetadataOptionMaps: {
          byUniversalIdentifier: {
            'LOW-option-id': getFlatFieldMetadataOptionMock({
              universalIdentifier: 'LOW-option-id',
              value: 'LOW',
              position: 0,
            }),
            'HIGH-option-id': getFlatFieldMetadataOptionMock({
              universalIdentifier: 'HIGH-option-id',
              value: 'HIGH',
              position: 1,
            }),
          },
        },
      }),
    ).toBe(true);
    expect(
      isRecordMatchingFilter({
        ...evaluationArgs,
        flatFieldMetadataOptionMaps: createEmptyFlatEntityMaps(),
      }),
    ).toBe(false);
  });
});
