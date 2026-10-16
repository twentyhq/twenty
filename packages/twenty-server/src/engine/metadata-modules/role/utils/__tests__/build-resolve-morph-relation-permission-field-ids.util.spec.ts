import { FieldMetadataType } from 'twenty-shared/types';

import { buildResolveMorphRelationPermissionFieldIds } from 'src/engine/metadata-modules/role/utils/build-resolve-morph-relation-permission-field-ids.util';

const morphField = (id: string, universalIdentifier: string) => ({
  id,
  universalIdentifier,
  morphId: 'target',
  type: FieldMetadataType.MORPH_RELATION,
});

const resolve = buildResolveMorphRelationPermissionFieldIds([
  morphField('target', 'target'),
  morphField('targetPerson', 'target-person-uid'),
  morphField('targetCompany', 'target-company-uid'),
]);

describe('buildResolveMorphRelationPermissionFieldIds', () => {
  it('resolves a head to itself and every target column', () => {
    expect(resolve('target')).toEqual([
      'target',
      'targetPerson',
      'targetCompany',
    ]);
  });

  it('resolves a target to its own column only', () => {
    expect(resolve('targetPerson')).toEqual(['targetPerson']);
  });

  it('resolves any other field to itself', () => {
    expect(resolve('name')).toEqual(['name']);
  });
});
