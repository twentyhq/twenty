import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeRelationConnectQueryConfigs } from 'src/engine/twenty-orm/utils/compute-relation-connect-query-configs.util';

describe('computeRelationConnectQueryConfigs', () => {
  const personFields: FlatFieldMetadata[] = [
    {
      id: 'person-id-field-id',
      name: 'id',
      type: FieldMetadataType.UUID,
      label: 'id',
      objectMetadataId: 'person-object-metadata-id',
      isNullable: false,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'person-id-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
    } as unknown as FlatFieldMetadata,
    {
      id: 'person-name-field-id',
      name: 'name',
      type: FieldMetadataType.FULL_NAME,
      label: 'name',
      objectMetadataId: 'person-object-metadata-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'person-name-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
    } as unknown as FlatFieldMetadata,
    {
      id: 'person-company-1-field-id',
      name: 'company-related-to-1',
      type: FieldMetadataType.RELATION,
      label: 'company-related-to-1',
      objectMetadataId: 'person-object-metadata-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'person-company-1-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      relationTargetObjectMetadataId: 'company-object-metadata-id',
      relationTargetFieldMetadataId: 'company-id-field-id',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'company-related-to-1Id',
      },
    } as unknown as FlatFieldMetadata,
    {
      id: 'person-company-2-field-id',
      name: 'company-related-to-2',
      type: FieldMetadataType.RELATION,
      label: 'company-related-to-2',
      objectMetadataId: 'person-object-metadata-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'person-company-2-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      relationTargetObjectMetadataId: 'company-object-metadata-id',
      relationTargetFieldMetadataId: 'company-id-field-id',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'company-related-to-2Id',
      },
    } as unknown as FlatFieldMetadata,
  ];

  const companyFields: FlatFieldMetadata[] = [
    {
      id: 'company-id-field-id',
      name: 'id',
      type: FieldMetadataType.UUID,
      label: 'id',
      objectMetadataId: 'company-object-metadata-id',
      isNullable: false,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'company-id-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
    } as unknown as FlatFieldMetadata,
    {
      id: 'company-name-field-id',
      name: 'name',
      type: FieldMetadataType.TEXT,
      label: 'name',
      objectMetadataId: 'company-object-metadata-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'company-name-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
    } as unknown as FlatFieldMetadata,
    {
      id: 'company-description-field-id',
      name: 'description',
      type: FieldMetadataType.TEXT,
      label: 'description',
      objectMetadataId: 'company-object-metadata-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'company-description-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
    } as unknown as FlatFieldMetadata,
    {
      id: 'company-domain-name-field-id',
      name: 'domainName',
      type: FieldMetadataType.LINKS,
      label: 'domainName',
      objectMetadataId: 'company-object-metadata-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'company-domain-name-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
    } as unknown as FlatFieldMetadata,
    {
      id: 'company-address-field-id',
      name: 'address',
      type: FieldMetadataType.TEXT,
      label: 'address',
      objectMetadataId: 'company-object-metadata-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: 'company-address-field-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
    } as unknown as FlatFieldMetadata,
  ];

  const allFields = [...personFields, ...companyFields];

  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
    byId: allFields.reduce(
      (acc, field) => {
        acc[field.id] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    idByUniversalIdentifier: allFields.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field.id;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  };

  const createFlatObjectMetadata = (
    partial: Partial<FlatObjectMetadata> & {
      id: string;
      nameSingular: string;
      fieldMetadataIds: string[];
      indexMetadataIds: string[];
    },
  ): FlatObjectMetadata =>
    ({
      namePlural: `${partial.nameSingular}s`,
      labelSingular: partial.nameSingular,
      labelPlural: `${partial.nameSingular}s`,
      icon: 'Icon',
      targetTableName: partial.nameSingular,
      workspaceId: 'workspace-id',
      isCustom: false,
      isRemote: false,
      isActive: true,
      isSystem: false,
      isAuditLogged: true,
      isSearchable: true,
      universalIdentifier: partial.id,
      viewIds: [],
      applicationId: null,
      isLabelSyncedWithName: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      shortcut: null,
      description: null,
      standardOverrides: null,
      isUIReadOnly: false,
      standardId: null,
      labelIdentifierFieldMetadataId: null,
      imageIdentifierFieldMetadataId: null,
      duplicateCriteria: null,
      ...partial,
    }) as FlatObjectMetadata;

  const personMetadata = createFlatObjectMetadata({
    id: 'person-object-metadata-id',
    nameSingular: 'person',
    indexMetadataIds: [],
    fieldMetadataIds: personFields.map((f) => f.id),
  });

  const companyMetadata = createFlatObjectMetadata({
    id: 'company-object-metadata-id',
    nameSingular: 'company',
    indexMetadataIds: [
      'company-id-index-metadata-id',
      'company-domain-index-metadata-id',
      'company-composite-index-metadata-id',
    ],
    fieldMetadataIds: companyFields.map((f) => f.id),
  });

  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
    byId: {
      'person-object-metadata-id': personMetadata,
      'company-object-metadata-id': companyMetadata,
    },
    idByUniversalIdentifier: {
      'person-object-metadata-id': 'person-object-metadata-id',
      'company-object-metadata-id': 'company-object-metadata-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  const createFlatIndexFieldMetadata = (
    id: string,
    fieldMetadataId: string,
    indexMetadataId: string,
    order: number,
  ) => ({
    id,
    fieldMetadataId,
    indexMetadataId,
    order,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const flatIndexMaps: FlatEntityMaps<FlatIndexMetadata> = {
    byId: {
      'company-id-index-metadata-id': {
        id: 'company-id-index-metadata-id',
        name: 'company-id-index-metadata-name',
        isUnique: true,
        objectMetadataId: 'company-object-metadata-id',
        universalIdentifier: 'company-id-index-metadata-id',
        flatIndexFieldMetadatas: [
          createFlatIndexFieldMetadata(
            'company-id-index-field-metadata-id',
            'company-id-field-id',
            'company-id-index-metadata-id',
            0,
          ),
        ],
      } as unknown as FlatIndexMetadata,
      'company-domain-index-metadata-id': {
        id: 'company-domain-index-metadata-id',
        name: 'company-domain-index-metadata-name',
        isUnique: true,
        objectMetadataId: 'company-object-metadata-id',
        universalIdentifier: 'company-domain-index-metadata-id',
        flatIndexFieldMetadatas: [
          createFlatIndexFieldMetadata(
            'company-domain-index-field-metadata-id',
            'company-domain-name-field-id',
            'company-domain-index-metadata-id',
            0,
          ),
        ],
      } as unknown as FlatIndexMetadata,
      'company-composite-index-metadata-id': {
        id: 'company-composite-index-metadata-id',
        name: 'company-composite-index-metadata-name',
        isUnique: true,
        objectMetadataId: 'company-object-metadata-id',
        universalIdentifier: 'company-composite-index-metadata-id',
        flatIndexFieldMetadatas: [
          createFlatIndexFieldMetadata(
            'company-name-index-field-metadata-id',
            'company-name-field-id',
            'company-composite-index-metadata-id',
            0,
          ),
          createFlatIndexFieldMetadata(
            'company-description-index-field-metadata-id',
            'company-description-field-id',
            'company-composite-index-metadata-id',
            1,
          ),
        ],
      } as unknown as FlatIndexMetadata,
    },
    idByUniversalIdentifier: {
      'company-id-index-metadata-id': 'company-id-index-metadata-id',
      'company-domain-index-metadata-id': 'company-domain-index-metadata-id',
      'company-composite-index-metadata-id':
        'company-composite-index-metadata-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  it('should return an empty object if no connect fields are found', () => {
    const peopleEntityInputs = [
      {
        id: '1',
        name: { lastName: 'Doe', firstName: 'John' },
      },
      {
        id: '2',
        name: { lastName: 'Doe', firstName: 'Jane' },
      },
    ];

    const result = computeRelationConnectQueryConfigs(
      peopleEntityInputs,
      personMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      {},
    );

    expect(result).toEqual([]);
  });

  it('should throw an error if a connect field is not a relation field', () => {
    const peopleEntityInputs = [
      {
        id: '1',
        name: { connect: { where: { name: { lastName: 'Doe' } } } },
      },
      {
        id: '2',
      },
    ];

    const relationConnectQueryFieldsByEntityIndex = {
      '0': {
        name: { connect: { where: { name: { lastName: 'Doe' } } } },
      },
    };

    expect(() => {
      computeRelationConnectQueryConfigs(
        peopleEntityInputs,
        personMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        relationConnectQueryFieldsByEntityIndex,
      );
    }).toThrow('Connect is not allowed for name on person');
  });

  it('should throw an error if connect field has not any unique constraint fully populated', () => {
    const peopleEntityInputs = [
      {
        id: '1',
        'company-related-to-1': {
          connect: { where: { name: 'company1' } },
        },
      },
    ];

    const relationConnectQueryFieldsByEntityIndex = {
      '0': {
        'company-related-to-1': { connect: { where: { name: 'company1' } } },
      },
    };

    expect(() => {
      computeRelationConnectQueryConfigs(
        peopleEntityInputs,
        personMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        relationConnectQueryFieldsByEntityIndex,
      );
    }).toThrow(
      "Missing required fields: at least one unique constraint have to be fully populated for 'company-related-to-1'.",
    );
  });

  it('should throw an error if connect field are not in constraint fields', () => {
    const peopleEntityInputs = [
      {
        id: '1',
        'company-related-to-1': {
          connect: {
            where: {
              domainName: { primaryLinkUrl: 'company1.com' },
              id: '1',
              address: 'company1 address',
            },
          },
        },
      },
    ];

    const relationConnectQueryFieldsByEntityIndex = {
      '0': {
        'company-related-to-1': {
          connect: {
            where: {
              domainName: { primaryLinkUrl: 'company1.com' },
              id: '1',
              address: 'company1 address',
            },
          },
        },
      },
    };

    expect(() => {
      computeRelationConnectQueryConfigs(
        peopleEntityInputs,
        personMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        relationConnectQueryFieldsByEntityIndex,
      );
    }).toThrow(
      "Field address is not a unique constraint field for 'company-related-to-1'.",
    );
  });

  it('should throw an error if connect field has different unique constraints populated', () => {
    const peopleEntityInputs = [
      {
        id: '1',
        'company-related-to-1': {
          connect: {
            where: {
              domainName: { primaryLinkUrl: 'company1.com' },
            },
          },
        },
      },
      {
        id: '2',
        'company-related-to-1': {
          connect: {
            where: { id: '2' },
          },
        },
      },
    ];

    const relationConnectQueryFieldsByEntityIndex = {
      '0': {
        'company-related-to-1': {
          connect: {
            where: {
              domainName: { primaryLinkUrl: 'company1.com' },
            },
          },
        },
      },
      '1': {
        'company-related-to-1': { connect: { where: { id: '2' } } },
      },
    };

    expect(() => {
      computeRelationConnectQueryConfigs(
        peopleEntityInputs,
        personMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        relationConnectQueryFieldsByEntityIndex,
      );
    }).toThrow(
      'Expected the same constraint fields to be used consistently across all operations for company-related-to-1.',
    );
  });

  it('should return the correct relation connect query configs', () => {
    const peopleEntityInputs = [
      {
        id: '1',
        'company-related-to-1': {
          connect: {
            where: {
              domainName: { primaryLinkUrl: 'company.com' },
            },
          },
        },
        'company-related-to-2': {
          connect: {
            where: { id: '1' },
          },
        },
      },
      {
        id: '2',
        'company-related-to-1': {
          connect: {
            where: { domainName: { primaryLinkUrl: 'other-company.com' } },
          },
        },
        'company-related-to-2': {
          connect: {
            where: { id: '2' },
          },
        },
      },
    ];

    const relationConnectQueryFieldsByEntityIndex = {
      '0': {
        'company-related-to-1': {
          connect: {
            where: { domainName: { primaryLinkUrl: 'company.com' } },
          },
        },
        'company-related-to-2': {
          connect: {
            where: { id: '1' },
          },
        },
      },
      '1': {
        'company-related-to-1': {
          connect: {
            where: { domainName: { primaryLinkUrl: 'other-company.com' } },
          },
        },
        'company-related-to-2': {
          connect: {
            where: { id: '2' },
          },
        },
      },
    };

    const result = computeRelationConnectQueryConfigs(
      peopleEntityInputs,
      personMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      relationConnectQueryFieldsByEntityIndex,
    );

    expect(result).toEqual([
      {
        connectFieldName: 'company-related-to-1',
        recordToConnectConditions: [
          [['domainNamePrimaryLinkUrl', 'company.com']],
          [['domainNamePrimaryLinkUrl', 'other-company.com']],
        ],
        recordToConnectConditionByEntityIndex: {
          '0': [['domainNamePrimaryLinkUrl', 'company.com']],
          '1': [['domainNamePrimaryLinkUrl', 'other-company.com']],
        },
        relationFieldName: 'company-related-to-1Id',
        targetObjectName: 'company',
        uniqueConstraintFields: [
          expect.objectContaining({
            id: 'company-domain-name-field-id',
            name: 'domainName',
            type: FieldMetadataType.LINKS,
          }),
        ],
      },
      {
        connectFieldName: 'company-related-to-2',
        recordToConnectConditions: [[['id', '1']], [['id', '2']]],
        recordToConnectConditionByEntityIndex: {
          '0': [['id', '1']],
          '1': [['id', '2']],
        },
        relationFieldName: 'company-related-to-2Id',
        targetObjectName: 'company',
        uniqueConstraintFields: [
          expect.objectContaining({
            id: 'company-id-field-id',
            name: 'id',
            type: FieldMetadataType.UUID,
          }),
        ],
      },
    ]);
  });
});
