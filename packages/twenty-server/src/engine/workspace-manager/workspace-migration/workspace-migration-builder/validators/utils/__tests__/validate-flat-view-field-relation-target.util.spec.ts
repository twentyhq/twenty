import {
  FieldMetadataType,
  RelationType,
  type UniversalViewFieldRelationScope,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { validateFlatViewFieldRelationTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-target.util';

const buildFlatFieldMetadata = (
  flatFieldMetadata: Partial<FlatFieldMetadata> &
    Pick<
      FlatFieldMetadata,
      'universalIdentifier' | 'type' | 'objectMetadataUniversalIdentifier'
    >,
) =>
  getFlatFieldMetadataMock({
    objectMetadataId: flatFieldMetadata.objectMetadataUniversalIdentifier,
    ...flatFieldMetadata,
  });

const personCompanyField = buildFlatFieldMetadata({
  universalIdentifier: 'person-company',
  type: FieldMetadataType.RELATION,
  objectMetadataUniversalIdentifier: 'person',
  relationTargetObjectMetadataUniversalIdentifier: 'company',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
});

const companyPeopleField = buildFlatFieldMetadata({
  universalIdentifier: 'company-people',
  type: FieldMetadataType.RELATION,
  objectMetadataUniversalIdentifier: 'company',
  relationTargetObjectMetadataUniversalIdentifier: 'person',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});

const flatFieldMetadatas = [
  personCompanyField,
  companyPeopleField,
  buildFlatFieldMetadata({
    universalIdentifier: 'company-industry',
    type: FieldMetadataType.TEXT,
    objectMetadataUniversalIdentifier: 'company',
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'company-deactivated',
    type: FieldMetadataType.TEXT,
    objectMetadataUniversalIdentifier: 'company',
    isActive: false,
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'person-emails',
    type: FieldMetadataType.EMAILS,
    objectMetadataUniversalIdentifier: 'person',
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'person-deactivated',
    type: FieldMetadataType.TEXT,
    objectMetadataUniversalIdentifier: 'person',
    isActive: false,
  }),
];

const flatFieldMetadataMaps = {
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
};

const EMPTY_SCOPE: UniversalViewFieldRelationScope = {
  filters: [],
  filterGroups: [],
  sorts: [],
};

const validate = ({
  flatFieldMetadata,
  relationTargetFieldMetadataUniversalIdentifier,
  universalRelationScope = null,
}: {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  relationTargetFieldMetadataUniversalIdentifier: string;
  universalRelationScope?: UniversalViewFieldRelationScope | null;
}) =>
  validateFlatViewFieldRelationTarget({
    flatViewField: {
      isCanonical: false,
      relationTargetFieldMetadataUniversalIdentifier,
      universalRelationScope,
    },
    flatFieldMetadata,
    flatFieldMetadataMaps,
  });

// The GraphQL input resolves the target by id, so only an application manifest can name a field that does not exist.
describe('validateFlatViewFieldRelationTarget', () => {
  it('rejects a related record field missing from the workspace', () => {
    expect(
      validate({
        flatFieldMetadata: personCompanyField,
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

  it('rejects a deactivated related record field', () => {
    expect(
      validate({
        flatFieldMetadata: personCompanyField,
        relationTargetFieldMetadataUniversalIdentifier: 'company-deactivated',
      }),
    ).toMatchObject([{ message: expect.stringContaining('must be active') }]);
  });

  it('accepts a field of the related record on a many-to-one relation', () => {
    expect(
      validate({
        flatFieldMetadata: personCompanyField,
        relationTargetFieldMetadataUniversalIdentifier: 'company-industry',
      }),
    ).toEqual([]);
  });

  it('accepts a field of the related records on a scoped one-to-many relation', () => {
    expect(
      validate({
        flatFieldMetadata: companyPeopleField,
        relationTargetFieldMetadataUniversalIdentifier: 'person-emails',
        universalRelationScope: EMPTY_SCOPE,
      }),
    ).toEqual([]);
  });

  it('rejects a field of the related records on a one-to-many relation without a scope', () => {
    expect(
      validate({
        flatFieldMetadata: companyPeopleField,
        relationTargetFieldMetadataUniversalIdentifier: 'person-emails',
      }),
    ).toMatchObject([
      {
        message: expect.stringContaining(
          'one-to-many relation field with a relation scope',
        ),
      },
    ]);
  });

  it.each([
    {
      title: 'a field of another object',
      relationTargetFieldMetadataUniversalIdentifier: 'company-industry',
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'a deactivated field',
      relationTargetFieldMetadataUniversalIdentifier: 'person-deactivated',
      expectedMessage: 'must be active',
    },
    {
      title: 'a relation',
      relationTargetFieldMetadataUniversalIdentifier: 'person-company',
      expectedMessage: 'cannot be a relation',
    },
  ])(
    'rejects $title on a scoped one-to-many relation',
    ({ relationTargetFieldMetadataUniversalIdentifier, expectedMessage }) => {
      expect(
        validate({
          flatFieldMetadata: companyPeopleField,
          relationTargetFieldMetadataUniversalIdentifier,
          universalRelationScope: EMPTY_SCOPE,
        }),
      ).toMatchObject([{ message: expect.stringContaining(expectedMessage) }]);
    },
  );

  it('rejects a scoped column on a many-to-one relation', () => {
    expect(
      validate({
        flatFieldMetadata: personCompanyField,
        relationTargetFieldMetadataUniversalIdentifier: 'company-industry',
        universalRelationScope: EMPTY_SCOPE,
      }),
    ).toMatchObject([
      { message: expect.stringContaining('many-to-one relation field') },
    ]);
  });
});
