import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { validateFlatViewFieldRelationTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-target.util';

// The GraphQL input resolves the target by id, so only an application manifest can name a field that does not exist.
describe('validateFlatViewFieldRelationTarget', () => {
  it('rejects a related record field missing from the workspace', () => {
    expect(
      validateFlatViewFieldRelationTarget({
        flatViewField: {
          isCanonical: false,
          relationTargetFieldMetadataUniversalIdentifier: 'missing-field',
        },
        flatFieldMetadata: {
          type: FieldMetadataType.RELATION,
          universalSettings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: 'companyId',
          },
          objectMetadataUniversalIdentifier: 'person-object',
          relationTargetObjectMetadataUniversalIdentifier: 'company-object',
        },
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
});
