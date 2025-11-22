import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { createIndexMigration } from 'src/engine/workspace-manager/workspace-migration-builder/factories/utils/workspace-migration-index.factory.utils';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('WorkspaceMigrationIndexFactory', () => {
  it('should create index migrations for simple fields', async () => {
    const simpleField = getMockFieldMetadataEntity({
      workspaceId: '20202020-0000-0000-0000-000000000000',
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      id: 'f1',
      type: FieldMetadataType.TEXT,
      name: 'simpleField',
      label: 'Simple Field',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const objectMetadata = {
      id: '20202020-0000-0000-0000-000000000002',
      workspaceId: '20202020-0000-0000-0000-000000000000',
      nameSingular: 'Test',
      fields: [simpleField],
      isCustom: false,
    };
    const indexMetadata = {
      name: 'idx_simple',
      isUnique: true,
      indexType: 'BTREE',
      indexWhereClause: null,
      indexFieldMetadatas: [{ fieldMetadataId: 'f1', order: 0 }],
    } as IndexMetadataEntity;
    const map = new Map([[objectMetadata, [indexMetadata]]]);
    const result = (await createIndexMigration(map)) as any;

    expect(result).toHaveLength(1);
    const firstMigration = result[0].migrations[0];

    expect(firstMigration.action).toBe('alter_indexes');
    expect(firstMigration.indexes[0].name).toBe('idx_simple');
    expect(firstMigration.indexes[0].columns).toEqual(['simpleField']);
    expect(firstMigration.indexes[0].type).toBe('BTREE');
    expect(firstMigration.indexes[0].isUnique).toBe(true);
    expect(firstMigration.indexes[0].where).toBeNull();
  });

  it('should create index migrations for relation fields', async () => {
    const relationField = getMockFieldMetadataEntity({
      workspaceId: '20202020-0000-0000-0000-000000000000',
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      id: 'f2',
      type: FieldMetadataType.RELATION,
      name: 'author',
      label: 'Author',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'authorId',
      },
    });

    const objectMetadata = {
      id: '20202020-0000-0000-0000-000000000003',
      workspaceId: '20202020-0000-0000-0000-000000000000',
      nameSingular: 'Attachment',
      fields: [relationField],
      isCustom: false,
    };
    const indexMetadata = {
      name: 'idx_rel',
      isUnique: false,
      indexType: 'BTREE',
      indexWhereClause: null,
      indexFieldMetadatas: [{ fieldMetadataId: 'f2', order: 0 }],
    } as IndexMetadataEntity;
    const map = new Map([[objectMetadata, [indexMetadata]]]);
    const result = (await createIndexMigration(map)) as any;

    const firstMigration = result[0].migrations[0];

    expect(firstMigration.indexes[0].columns).toEqual(['authorId']);
  });
});
