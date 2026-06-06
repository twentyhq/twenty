import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

// Pin the deterministic index names produced by the shared engine for
// canonical input shapes. Any future engine refactor that perturbs a hash
// trips here locally instead of after a workspace migration starts failing
// on a customer install.
describe('generateFlatIndexMetadataWithNameOrThrow', () => {
  const now = '2026-05-25T00:00:00.000Z';

  const companyObject = {
    universalIdentifier: 'obj-company',
    nameSingular: 'company',
    isCustom: false,
  } as UniversalFlatObjectMetadata;

  const scalarUniqueField = {
    universalIdentifier: 'field-domain',
    name: 'domainName',
    type: FieldMetadataType.TEXT,
    isUnique: true,
  } as UniversalFlatFieldMetadata;

  const scalarNonUniqueField = {
    universalIdentifier: 'field-employees',
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    isUnique: false,
  } as UniversalFlatFieldMetadata;

  const tsVectorField = {
    universalIdentifier: 'field-search',
    name: 'searchVector',
    type: FieldMetadataType.TS_VECTOR,
    isUnique: false,
  } as UniversalFlatFieldMetadata;

  const manyToOneRelationField = {
    universalIdentifier: 'field-account-owner',
    name: 'accountOwner',
    type: FieldMetadataType.RELATION,
    isUnique: false,
    universalSettings: { relationType: RelationType.MANY_TO_ONE },
  } as unknown as UniversalFlatFieldMetadata;

  const buildIndex = (overrides: {
    universalIdentifier: string;
    isUnique: boolean;
    indexType: IndexType;
    fieldIds: string[];
    indexWhereClause?: string | null;
  }) => ({
    createdAt: now,
    updatedAt: now,
    universalIdentifier: overrides.universalIdentifier,
    applicationUniversalIdentifier: 'app-standard',
    objectMetadataUniversalIdentifier: companyObject.universalIdentifier,
    indexType: overrides.indexType,
    indexWhereClause: overrides.indexWhereClause ?? null,
    isCustom: false,
    isUnique: overrides.isUnique,
    universalFlatIndexFieldMetadatas: overrides.fieldIds.map((id, order) => ({
      createdAt: now,
      updatedAt: now,
      order,
      subFieldName: null,
      fieldMetadataUniversalIdentifier: id,
      indexMetadataUniversalIdentifier: overrides.universalIdentifier,
    })),
  });

  it('pins names for representative standard-index shapes', () => {
    const fields = [
      scalarUniqueField,
      scalarNonUniqueField,
      tsVectorField,
      manyToOneRelationField,
    ];

    const scalarUnique = generateFlatIndexMetadataWithNameOrThrow({
      flatObjectMetadata: companyObject,
      objectFlatFieldMetadatas: fields,
      flatIndex: buildIndex({
        universalIdentifier: 'idx-scalar-unique',
        isUnique: true,
        indexType: IndexType.BTREE,
        fieldIds: [scalarUniqueField.universalIdentifier],
      }),
    });

    const scalarNonUnique = generateFlatIndexMetadataWithNameOrThrow({
      flatObjectMetadata: companyObject,
      objectFlatFieldMetadatas: fields,
      flatIndex: buildIndex({
        universalIdentifier: 'idx-scalar-non-unique',
        isUnique: false,
        indexType: IndexType.BTREE,
        fieldIds: [scalarNonUniqueField.universalIdentifier],
      }),
    });

    const searchVectorGin = generateFlatIndexMetadataWithNameOrThrow({
      flatObjectMetadata: companyObject,
      objectFlatFieldMetadatas: fields,
      flatIndex: buildIndex({
        universalIdentifier: 'idx-search-vector',
        isUnique: false,
        indexType: IndexType.GIN,
        fieldIds: [tsVectorField.universalIdentifier],
      }),
    });

    const manyToOneJoin = generateFlatIndexMetadataWithNameOrThrow({
      flatObjectMetadata: companyObject,
      objectFlatFieldMetadatas: fields,
      flatIndex: buildIndex({
        universalIdentifier: 'idx-account-owner',
        isUnique: false,
        indexType: IndexType.BTREE,
        fieldIds: [manyToOneRelationField.universalIdentifier],
      }),
    });

    const partialUnique = generateFlatIndexMetadataWithNameOrThrow({
      flatObjectMetadata: companyObject,
      objectFlatFieldMetadatas: fields,
      flatIndex: buildIndex({
        universalIdentifier: 'idx-scalar-unique-partial',
        isUnique: true,
        indexType: IndexType.BTREE,
        fieldIds: [scalarUniqueField.universalIdentifier],
        indexWhereClause: '"deletedAt" IS NULL',
      }),
    });

    expect({
      scalarUnique: scalarUnique.name,
      scalarNonUnique: scalarNonUnique.name,
      searchVectorGin: searchVectorGin.name,
      manyToOneJoin: manyToOneJoin.name,
      partialUnique: partialUnique.name,
    }).toMatchSnapshot();
  });
});
