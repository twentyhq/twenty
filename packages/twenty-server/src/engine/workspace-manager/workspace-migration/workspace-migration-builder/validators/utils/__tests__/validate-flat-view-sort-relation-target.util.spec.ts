import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { validateFlatViewSortRelationTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-sort-relation-target.util';

const companyRelationFlatFieldMetadata = {
  type: FieldMetadataType.RELATION,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
  objectMetadataUniversalIdentifier: 'person-object',
  relationTargetObjectMetadataUniversalIdentifier: 'company-object',
} as UniversalFlatFieldMetadata;

const buildCompanyFlatFieldMetadata = (
  overrides: Partial<UniversalFlatFieldMetadata>,
) =>
  ({
    universalIdentifier: 'employees-field',
    type: FieldMetadataType.NUMBER,
    objectMetadataUniversalIdentifier: 'company-object',
    isActive: true,
    ...overrides,
  }) as UniversalFlatFieldMetadata;

const validate = ({
  flatFieldMetadata = companyRelationFlatFieldMetadata,
  relationTargetFlatFieldMetadata = buildCompanyFlatFieldMetadata({}),
  relationTargetFieldMetadataUniversalIdentifier = 'employees-field',
}: {
  flatFieldMetadata?: UniversalFlatFieldMetadata;
  relationTargetFlatFieldMetadata?: UniversalFlatFieldMetadata;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
}) =>
  validateFlatViewSortRelationTarget({
    flatViewSort: { relationTargetFieldMetadataUniversalIdentifier },
    flatFieldMetadata,
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {
        [relationTargetFlatFieldMetadata.universalIdentifier]:
          relationTargetFlatFieldMetadata,
      },
    },
  });

describe('validateFlatViewSortRelationTarget', () => {
  it('accepts a sort without a related record field', () => {
    expect(
      validate({
        flatFieldMetadata: buildCompanyFlatFieldMetadata({}),
        relationTargetFieldMetadataUniversalIdentifier: null,
      }),
    ).toEqual([]);
  });

  it('accepts a field of the related object on a many-to-one relation', () => {
    expect(validate({})).toEqual([]);
  });

  it('rejects a sort on a field that is not a relation', () => {
    expect(
      validate({
        flatFieldMetadata: buildCompanyFlatFieldMetadata({
          type: FieldMetadataType.TEXT,
        }),
      }),
    ).toMatchObject([
      { message: expect.stringContaining('many-to-one relation field') },
    ]);
  });

  it('rejects a sort on a one-to-many relation', () => {
    expect(
      validate({
        flatFieldMetadata: {
          ...companyRelationFlatFieldMetadata,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
        } as UniversalFlatFieldMetadata,
      }),
    ).toMatchObject([
      { message: expect.stringContaining('many-to-one relation field') },
    ]);
  });

  it('rejects a sort on a morph relation', () => {
    expect(
      validate({
        flatFieldMetadata: {
          ...companyRelationFlatFieldMetadata,
          type: FieldMetadataType.MORPH_RELATION,
        } as UniversalFlatFieldMetadata,
      }),
    ).toMatchObject([
      { message: expect.stringContaining('many-to-one relation field') },
    ]);
  });

  // The GraphQL input resolves the target by id, so only an application manifest can name a field that does not exist
  it('rejects a related record field missing from the workspace', () => {
    expect(
      validate({
        relationTargetFieldMetadataUniversalIdentifier: 'missing-field',
      }),
    ).toMatchObject([
      {
        message: expect.stringContaining(
          'must belong to the relation target object',
        ),
      },
    ]);
  });

  it('rejects a field of another object', () => {
    expect(
      validate({
        relationTargetFlatFieldMetadata: buildCompanyFlatFieldMetadata({
          objectMetadataUniversalIdentifier: 'person-object',
        }),
      }),
    ).toMatchObject([
      {
        message: expect.stringContaining(
          'must belong to the relation target object',
        ),
      },
    ]);
  });

  it('rejects a deactivated related record field', () => {
    expect(
      validate({
        relationTargetFlatFieldMetadata: buildCompanyFlatFieldMetadata({
          isActive: false,
        }),
      }),
    ).toMatchObject([{ message: expect.stringContaining('must be active') }]);
  });

  it('rejects a related record field that is itself a relation', () => {
    expect(
      validate({
        relationTargetFlatFieldMetadata: buildCompanyFlatFieldMetadata({
          type: FieldMetadataType.RELATION,
        }),
      }),
    ).toMatchObject([
      { message: expect.stringContaining('cannot be a relation') },
    ]);
  });
});
