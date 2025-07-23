import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { computeRelationConnectQueryConfigs } from 'src/engine/twenty-orm/utils/compute-relation-connect-query-configs.util';

describe('computeRelationConnectQueryConfigs', () => {
  const personMetadata = {
    id: 'person-object-metadata-id',
    nameSingular: 'person',
    fieldsById: {
      'person-id-field-id': {
        id: 'person-id-field-id',
        name: 'id',
        type: FieldMetadataType.UUID,
        label: 'id',
      },
      'person-name-field-id': {
        id: 'person-name-field-id',
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
        label: 'name',
      },
      'person-company-1-field-id': {
        id: 'person-company-1-field-id',
        name: 'company-related-to-1',
        type: FieldMetadataType.RELATION,
        label: 'company-related-to-1',
        relationTargetObjectMetadataId: 'company-object-metadata-id',
        relationTargetFieldMetadataId: 'company-id-field-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
        },
      },
      'person-company-2-field-id': {
        id: 'person-company-2-field-id',
        name: 'company-related-to-2',
        type: FieldMetadataType.RELATION,
        label: 'company-related-to-2',
        relationTargetObjectMetadataId: 'company-object-metadata-id',
        relationTargetFieldMetadataId: 'company-id-field-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
        },
      },
    },
    fieldIdByName: {
      id: 'person-id-field-id',
      name: 'person-name-field-id',
      'company-related-to-1': 'person-company-1-field-id',
      'company-related-to-2': 'person-company-2-field-id',
    },
  } as unknown as ObjectMetadataItemWithFieldMaps;

  const companyMetadata = {
    id: 'company-object-metadata-id',
    nameSingular: 'company',
    indexMetadatas: [
      {
        id: 'company-id-index-metadata-id',
        name: 'company-id-index-metadata-name',
        indexFieldMetadatas: [
          {
            fieldMetadataId: 'company-id-field-id',
          },
        ],
        isUnique: true,
      },
      {
        id: 'company-domain-index-metadata-id',
        name: 'company-domain-index-metadata-name',
        indexFieldMetadatas: [
          {
            fieldMetadataId: 'company-domain-name-field-id',
          },
        ],
        isUnique: true,
      },
      {
        id: 'company-composite-index-metadata-id',
        name: 'company-composite-index-metadata-name',
        indexFieldMetadatas: [
          {
            fieldMetadataId: 'company-name-field-id',
          },
          {
            fieldMetadataId: 'company-description-field-id',
          },
        ],
        isUnique: true,
      },
    ],
    fieldsById: {
      'company-id-field-id': {
        id: 'company-id-field-id',
        name: 'id',
        type: FieldMetadataType.UUID,
        label: 'id',
      },
      'company-name-field-id': {
        id: 'company-name-field-id',
        name: 'name',
        type: FieldMetadataType.TEXT,
        label: 'name',
      },
      'company-description-field-id': {
        id: 'company-description-field-id',
        name: 'description',
        type: FieldMetadataType.TEXT,
        label: 'description',
      },
      'company-domain-name-field-id': {
        id: 'company-domain-name-field-id',
        name: 'domainName',
        type: FieldMetadataType.LINKS,
        label: 'domainName',
      },
      'company-address-field-id': {
        id: 'company-address-field-id',
        name: 'address',
        type: FieldMetadataType.TEXT,
        label: 'address',
      },
    },
    fieldIdByName: {
      id: 'company-id-field-id',
      name: 'company-name-field-id',
      description: 'company-description-field-id',
      domainName: 'company-domain-name-field-id',
      address: 'company-address-field-id',
    },
  } as unknown as ObjectMetadataItemWithFieldMaps;

  const objectMetadataMaps = {
    byId: {
      'person-object-metadata-id': personMetadata,
      'company-object-metadata-id': companyMetadata,
    },
    idByNameSingular: {
      person: 'person-object-metadata-id',
      company: 'company-object-metadata-id',
    },
  } as ObjectMetadataMaps;

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
      objectMetadataMaps,
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
        objectMetadataMaps,
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
        objectMetadataMaps,
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
        objectMetadataMaps,
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
        objectMetadataMaps,
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
      objectMetadataMaps,
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
          {
            id: 'company-domain-name-field-id',
            label: 'domainName',
            name: 'domainName',
            type: FieldMetadataType.LINKS,
          },
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
          {
            id: 'company-id-field-id',
            label: 'id',
            name: 'id',
            type: FieldMetadataType.UUID,
          },
        ],
      },
    ]);
  });
});
