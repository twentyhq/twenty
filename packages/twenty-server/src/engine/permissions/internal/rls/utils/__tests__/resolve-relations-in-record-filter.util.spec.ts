import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
  RelationType,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { resolveRelationsInRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-relations-in-record-filter.util';

const PERSON_ID = 'person-object-id';
const COMPANY_ID = 'company-object-id';

const person = getFlatObjectMetadataMock({
  id: PERSON_ID,
  universalIdentifier: PERSON_ID,
  nameSingular: 'person',
  fieldIds: ['company-field-id', 'job-title-field-id'],
});
const company = getFlatObjectMetadataMock({
  id: COMPANY_ID,
  universalIdentifier: COMPANY_ID,
  nameSingular: 'company',
  fieldIds: ['name-field-id', 'people-field-id'],
});

const flatObjectMetadataMaps = [person, company].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);
const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'company-field-id',
    universalIdentifier: 'company-field-id',
    objectMetadataId: PERSON_ID,
    type: FieldMetadataType.RELATION,
    name: 'company',
    relationTargetObjectMetadataId: COMPANY_ID,
    relationTargetFieldMetadataId: 'people-field-id',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'companyId',
    },
  }),
  getFlatFieldMetadataMock({
    id: 'people-field-id',
    universalIdentifier: 'people-field-id',
    objectMetadataId: COMPANY_ID,
    type: FieldMetadataType.RELATION,
    name: 'people',
    relationTargetObjectMetadataId: PERSON_ID,
    relationTargetFieldMetadataId: 'company-field-id',
    settings: { relationType: RelationType.ONE_TO_MANY },
  }),
  getFlatFieldMetadataMock({
    id: 'name-field-id',
    universalIdentifier: 'name-field-id',
    objectMetadataId: COMPANY_ID,
    type: FieldMetadataType.TEXT,
    name: 'name',
  }),
  getFlatFieldMetadataMock({
    id: 'job-title-field-id',
    universalIdentifier: 'job-title-field-id',
    objectMetadataId: PERSON_ID,
    type: FieldMetadataType.TEXT,
    name: 'jobTitle',
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const metadataMaps = { flatFieldMetadataMaps, flatObjectMetadataMaps };

describe('resolveRelationsInRecordFilter', () => {
  it('should turn a many to one relation into a filter on the join column', async () => {
    const findRelationJoinValues = jest.fn().mockResolvedValue(['company-1']);

    await expect(
      resolveRelationsInRecordFilter({
        recordFilter: { company: { name: { eq: 'Acme' } } },
        flatObjectMetadata: person,
        records: [
          { id: 'person-1', companyId: 'company-1' },
          { id: 'person-2' },
        ],
        metadataMaps,
        findRelationJoinValues,
      }),
    ).resolves.toEqual({ companyId: { in: ['company-1'] } });

    expect(findRelationJoinValues).toHaveBeenCalledWith(
      expect.objectContaining({
        targetFlatObjectMetadata: company,
        targetColumnName: 'id',
        joinValues: ['company-1'],
      }),
    );
  });

  it('should turn a one to many relation into a filter on the record id', async () => {
    const findRelationJoinValues = jest.fn().mockResolvedValue(['company-1']);

    await expect(
      resolveRelationsInRecordFilter({
        recordFilter: {
          people: { jobTitle: { eq: 'CEO' } },
        } as RecordGqlOperationFilter,
        flatObjectMetadata: company,
        records: [{ id: 'company-1' }, { id: 'company-2' }],
        metadataMaps,
        findRelationJoinValues,
      }),
    ).resolves.toEqual({ id: { in: ['company-1'] } });

    expect(findRelationJoinValues).toHaveBeenCalledWith(
      expect.objectContaining({
        targetFlatObjectMetadata: person,
        targetColumnName: 'companyId',
        joinValues: ['company-1', 'company-2'],
      }),
    );
  });

  it('should resolve relations inside logical groups and keep plain fields', async () => {
    await expect(
      resolveRelationsInRecordFilter({
        recordFilter: {
          or: [
            { jobTitle: { eq: 'CEO' } },
            { not: { company: { name: { eq: 'Acme' } } } },
          ],
        },
        flatObjectMetadata: person,
        records: [{ id: 'person-1', companyId: 'company-1' }],
        metadataMaps,
        findRelationJoinValues: jest.fn().mockResolvedValue([]),
      }),
    ).resolves.toEqual({
      or: [{ jobTitle: { eq: 'CEO' } }, { not: { companyId: { in: [] } } }],
    });
  });
});
