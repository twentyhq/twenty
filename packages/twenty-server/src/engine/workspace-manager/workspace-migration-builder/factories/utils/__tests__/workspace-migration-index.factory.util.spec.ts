import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { createIndexMigration } from 'src/engine/workspace-manager/workspace-migration-builder/factories/utils/workspace-migration-index.factory.utils';

describe('WorkspaceMigrationIndexFactory', () => {
  it('should create index migrations for simple fields', async () => {
    const objectMetadata = {
      id: 'obj1',
      workspaceId: 'ws1',
      nameSingular: 'Test',
      fields: [{ id: 'f1', name: 'simpleField', type: FieldMetadataType.TEXT }],
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
    expect(firstMigration.indexes[0].where).toBe(
      '"simpleField" != \'\' AND "deletedAt" IS NULL',
    );
  });

  it('should create index migrations for relation fields', async () => {
    const fieldMetadata: Pick<
      FieldMetadataEntity<FieldMetadataType.RELATION>,
      'id' | 'name' | 'type' | 'settings' | 'isCustom'
    > = {
      id: 'f2',
      name: 'author',
      type: FieldMetadataType.RELATION,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'authorId',
      },
      isCustom: false,
    };

    const objectMetadata = {
      id: 'obj2',
      workspaceId: 'ws1',
      nameSingular: 'Attachment',
      fields: [fieldMetadata],
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
