import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildManyToOneForeignKeyDefinition } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/build-many-to-one-foreign-key-definition.util';

const TARGET_OBJECT_ID = '20202020-1111-4444-8888-000000000001';
const TARGET_OBJECT_UNIVERSAL_IDENTIFIER = 'company-universal-identifier';

const targetFlatObjectMetadata = getFlatObjectMetadataMock({
  id: TARGET_OBJECT_ID,
  universalIdentifier: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'company',
  namePlural: 'companies',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
});

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    [TARGET_OBJECT_UNIVERSAL_IDENTIFIER]: targetFlatObjectMetadata,
  },
  universalIdentifierById: {
    [TARGET_OBJECT_ID]: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
  },
  universalIdentifiersByApplicationId: {},
};

const buildRelationField = (
  overrides: Partial<FlatFieldMetadata> = {},
): FlatFieldMetadata<MorphOrRelationFieldMetadataType> =>
  getFlatFieldMetadataMock({
    universalIdentifier: 'company-relation-field',
    objectMetadataId: '20202020-1111-4444-8888-000000000002',
    type: FieldMetadataType.RELATION,
    name: 'company',
    relationTargetObjectMetadataId: TARGET_OBJECT_ID,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
    },
    ...overrides,
  }) as FlatFieldMetadata<MorphOrRelationFieldMetadataType>;

describe('buildManyToOneForeignKeyDefinition', () => {
  it('should point the join column at the target table primary key', () => {
    expect(
      buildManyToOneForeignKeyDefinition({
        flatFieldMetadata: buildRelationField(),
        flatObjectMetadataMaps,
        tableName: 'person',
      }),
    ).toEqual({
      tableName: 'person',
      columnName: 'companyId',
      referencedTableName: 'company',
      referencedColumnName: 'id',
      onDelete: 'SET NULL',
    });
  });

  it('should default to cascade when the field carries no on delete setting', () => {
    expect(
      buildManyToOneForeignKeyDefinition({
        flatFieldMetadata: buildRelationField({
          settings: { relationType: RelationType.MANY_TO_ONE },
        }),
        flatObjectMetadataMaps,
        tableName: 'person',
      }).onDelete,
    ).toBe('CASCADE');
  });
});
