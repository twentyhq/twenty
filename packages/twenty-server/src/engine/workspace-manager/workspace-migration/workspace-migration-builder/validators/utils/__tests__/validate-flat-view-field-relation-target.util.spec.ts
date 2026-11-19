import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { validateFlatViewFieldRelationTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-target.util';

const companyRelationFlatFieldMetadata = {
  type: FieldMetadataType.RELATION,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
  objectMetadataUniversalIdentifier: 'person-object',
  relationTargetObjectMetadataUniversalIdentifier: 'company-object',
} as UniversalFlatFieldMetadata;

// The GraphQL input resolves the target by id, so only an application manifest can name a field that does not exist.
describe('validateFlatViewFieldRelationTarget', () => {
  it('rejects a related record field missing from the workspace', () => {
    expect(
      validateFlatViewFieldRelationTarget({
        flatViewField: {
          isCanonical: false,
          relationTargetFieldMetadataUniversalIdentifier: 'missing-field',
        },
        flatFieldMetadata: companyRelationFlatFieldMetadata,
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
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
      validateFlatViewFieldRelationTarget({
        flatViewField: {
          isCanonical: false,
          relationTargetFieldMetadataUniversalIdentifier: 'industry-field',
        },
        flatFieldMetadata: companyRelationFlatFieldMetadata,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            'industry-field': {
              universalIdentifier: 'industry-field',
              type: FieldMetadataType.TEXT,
              objectMetadataUniversalIdentifier: 'company-object',
              isActive: false,
            } as UniversalFlatFieldMetadata,
          },
        },
      }),
    ).toMatchObject([{ message: expect.stringContaining('must be active') }]);
  });
});
