import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getManyToOneForeignKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/utils/get-many-to-one-foreign-key.util';

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

const queryRunner = {
  connection: {
    namingStrategy: {
      foreignKeyName: (
        tableName: string,
        columnNames: string[],
        referencedTablePath: string,
      ) => `FK_${tableName}_${columnNames[0]}_${referencedTablePath}`,
    },
  },
} as unknown as QueryRunner;

const buildRelationField = (
  overrides: Partial<FlatFieldMetadata> = {},
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: 'company-relation-field',
    objectMetadataId: '20202020-1111-4444-8888-000000000002',
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: TARGET_OBJECT_ID,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
    },
    ...overrides,
  });

describe('getManyToOneForeignKey', () => {
  it('should derive the join column, the referenced table and the constraint name', () => {
    expect(
      getManyToOneForeignKey({
        flatFieldMetadata: buildRelationField(),
        flatObjectMetadataMaps,
        queryRunner,
        schemaName: 'workspace_abc',
        tableName: 'person',
      }),
    ).toEqual({
      columnName: 'companyId',
      referencedTableName: 'company',
      foreignKeyName: 'FK_person_companyId_workspace_abc.company',
      onDelete: 'SET NULL',
    });
  });

  it('should default to cascade when the field carries no on delete setting', () => {
    expect(
      getManyToOneForeignKey({
        flatFieldMetadata: buildRelationField({
          settings: { relationType: RelationType.MANY_TO_ONE },
        }),
        flatObjectMetadataMaps,
        queryRunner,
        schemaName: 'workspace_abc',
        tableName: 'person',
      })?.onDelete,
    ).toBe('CASCADE');
  });

  it('should return undefined for the one to many side, which has no join column', () => {
    expect(
      getManyToOneForeignKey({
        flatFieldMetadata: buildRelationField({
          settings: { relationType: RelationType.ONE_TO_MANY },
        }),
        flatObjectMetadataMaps,
        queryRunner,
        schemaName: 'workspace_abc',
        tableName: 'person',
      }),
    ).toBeUndefined();
  });

  it('should return undefined for a field that is not a relation', () => {
    expect(
      getManyToOneForeignKey({
        flatFieldMetadata: getFlatFieldMetadataMock({
          universalIdentifier: 'name-field',
          objectMetadataId: '20202020-1111-4444-8888-000000000002',
          name: 'name',
          type: FieldMetadataType.TEXT,
        }),
        flatObjectMetadataMaps,
        queryRunner,
        schemaName: 'workspace_abc',
        tableName: 'person',
      }),
    ).toBeUndefined();
  });
});
