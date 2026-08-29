import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

jest.mock(
  'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util',
  () => {
    const actual = jest.requireActual(
      'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util',
    );

    return {
      ...actual,
      getFlatFieldsFromFlatObjectMetadata: jest.fn(
        actual.getFlatFieldsFromFlatObjectMetadata,
      ),
    };
  },
);

const buildFlatEntityMaps = <
  TFlatEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce(
    (maps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<TFlatEntity>,
  );

describe('formatResult', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reuses derived field metadata per object type within one invocation', () => {
    const companyObjectMetadataId = '20202020-3c25-4d02-bf25-6aeccf7ea419';
    const personObjectMetadataId = '20202020-4c25-4d02-bf25-6aeccf7ea419';
    const companyNameFieldMetadata = getFlatFieldMetadataMock({
      id: '20202020-5c25-4d02-bf25-6aeccf7ea419',
      universalIdentifier: '20202020-6c25-4d02-bf25-6aeccf7ea419',
      objectMetadataId: companyObjectMetadataId,
      objectMetadataUniversalIdentifier: '20202020-7c25-4d02-bf25-6aeccf7ea419',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const companyPeopleFieldMetadata = getFlatFieldMetadataMock({
      id: '20202020-8c25-4d02-bf25-6aeccf7ea419',
      universalIdentifier: '20202020-9c25-4d02-bf25-6aeccf7ea419',
      objectMetadataId: companyObjectMetadataId,
      objectMetadataUniversalIdentifier:
        companyNameFieldMetadata.objectMetadataUniversalIdentifier,
      name: 'people',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: personObjectMetadataId,
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    });
    const personNameFieldMetadata = getFlatFieldMetadataMock({
      id: '20202020-ac25-4d02-bf25-6aeccf7ea419',
      universalIdentifier: '20202020-bc25-4d02-bf25-6aeccf7ea419',
      objectMetadataId: personObjectMetadataId,
      objectMetadataUniversalIdentifier: '20202020-cc25-4d02-bf25-6aeccf7ea419',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const companyObjectMetadata = getFlatObjectMetadataMock({
      id: companyObjectMetadataId,
      universalIdentifier:
        companyNameFieldMetadata.objectMetadataUniversalIdentifier,
      fieldIds: [companyNameFieldMetadata.id, companyPeopleFieldMetadata.id],
    });
    const personObjectMetadata = getFlatObjectMetadataMock({
      id: personObjectMetadataId,
      universalIdentifier:
        personNameFieldMetadata.objectMetadataUniversalIdentifier,
      fieldIds: [personNameFieldMetadata.id],
    });
    const flatObjectMetadataMaps = buildFlatEntityMaps([
      companyObjectMetadata,
      personObjectMetadata,
    ]);
    const flatFieldMetadataMaps = buildFlatEntityMaps([
      companyNameFieldMetadata,
      companyPeopleFieldMetadata,
      personNameFieldMetadata,
    ]);
    const records = [
      {
        name: 'Acme',
        people: [{ name: 'Alice' }, { name: 'Bob' }],
      },
      {
        name: 'Globex',
        people: [{ name: 'Carol' }],
      },
    ];

    const formattedRecords = formatResult(
      records,
      companyObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    expect(formattedRecords).toEqual(records);

    const firstInvocationMetadataLookupCount = jest.mocked(
      getFlatFieldsFromFlatObjectMetadata,
    ).mock.calls.length;

    expect(firstInvocationMetadataLookupCount).toBeGreaterThan(0);
    expect(firstInvocationMetadataLookupCount).toBeLessThanOrEqual(4);

    // Field maps derived from a metadata snapshot are memoized by object
    // identity, so a second invocation only re-runs the lookups when it receives
    // fresh snapshot objects
    const rebuiltFlatFieldMetadataMaps = buildFlatEntityMaps([
      companyNameFieldMetadata,
      companyPeopleFieldMetadata,
      personNameFieldMetadata,
    ]);

    formatResult(
      records,
      companyObjectMetadata,
      flatObjectMetadataMaps,
      rebuiltFlatFieldMetadataMaps,
    );

    expect(
      jest.mocked(getFlatFieldsFromFlatObjectMetadata).mock.calls.length,
    ).toBe(firstInvocationMetadataLookupCount * 2);
  });
});
