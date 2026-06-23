import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

const buildArgs = <T extends AllMetadataName>(
  metadataName: T,
  entity: Record<string, unknown>,
): {
  metadataName: T;
  entity: EntityWithRegroupedOneToManyRelations<MetadataEntity<T>>;
} => ({
  metadataName,
  entity: entity as unknown as EntityWithRegroupedOneToManyRelations<
    MetadataEntity<T>
  >,
});

describe('fromEntityToScalarEntity', () => {
  it('should return the registered scalar properties along with the base columns', () => {
    const result = fromEntityToScalarEntity(
      buildArgs('permissionFlag', {
        id: 'permission-flag-id-1',
        workspaceId: 'workspace-id-1',
        applicationId: 'app-id-1',
        universalIdentifier: 'permission-flag-ui-1',
        key: 'IMPERSONATE',
        label: 'Impersonate',
        description: 'Allows impersonation',
        icon: 'IconUser',
        permissionType: 'WORKSPACE',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      }),
    );

    expect(result).toEqual({
      id: 'permission-flag-id-1',
      workspaceId: 'workspace-id-1',
      applicationId: 'app-id-1',
      universalIdentifier: 'permission-flag-ui-1',
      key: 'IMPERSONATE',
      label: 'Impersonate',
      description: 'Allows impersonation',
      icon: 'IconUser',
      permissionType: 'WORKSPACE',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    });
  });

  it('should drop relation objects, regrouped one-to-many arrays and any unregistered property', () => {
    const result = fromEntityToScalarEntity(
      buildArgs('permissionFlag', {
        id: 'permission-flag-id-1',
        workspaceId: 'workspace-id-1',
        applicationId: 'app-id-1',
        universalIdentifier: 'permission-flag-ui-1',
        key: 'IMPERSONATE',
        label: 'Impersonate',
        description: 'Allows impersonation',
        icon: 'IconUser',
        permissionType: 'WORKSPACE',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        workspace: { id: 'workspace-id-1' },
        application: { id: 'app-id-1' },
        rolePermissionFlags: [{ id: 'role-permission-flag-id-1' }],
        someTransientProperty: 'should-not-leak',
      }),
    );

    expect(Object.keys(result).sort()).toEqual(
      [
        'id',
        'workspaceId',
        'applicationId',
        'universalIdentifier',
        'key',
        'label',
        'description',
        'icon',
        'permissionType',
        'createdAt',
        'updatedAt',
      ].sort(),
    );
    expect(result).not.toHaveProperty('workspace');
    expect(result).not.toHaveProperty('application');
    expect(result).not.toHaveProperty('rolePermissionFlags');
    expect(result).not.toHaveProperty('someTransientProperty');
  });

  it('should keep many-to-one foreign key columns while dropping their relation objects', () => {
    const result = fromEntityToScalarEntity(
      buildArgs('viewSort', {
        id: 'view-sort-id-1',
        workspaceId: 'workspace-id-1',
        applicationId: 'app-id-1',
        universalIdentifier: 'view-sort-ui-1',
        direction: 'ASC',
        subFieldName: null,
        fieldMetadataId: 'field-id-1',
        viewId: 'view-id-1',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        deletedAt: null,
        fieldMetadata: { id: 'field-id-1' },
        view: { id: 'view-id-1' },
      }),
    );

    expect(result.fieldMetadataId).toBe('field-id-1');
    expect(result.viewId).toBe('view-id-1');
    expect(result).not.toHaveProperty('fieldMetadata');
    expect(result).not.toHaveProperty('view');
  });

  it('should serialize Date columns to ISO strings while leaving null dates untouched', () => {
    const result = fromEntityToScalarEntity(
      buildArgs('viewSort', {
        id: 'view-sort-id-1',
        workspaceId: 'workspace-id-1',
        applicationId: 'app-id-1',
        universalIdentifier: 'view-sort-ui-1',
        direction: 'ASC',
        subFieldName: null,
        fieldMetadataId: 'field-id-1',
        viewId: 'view-id-1',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        deletedAt: null,
      }),
    );

    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2024-01-02T00:00:00.000Z');
    expect(result.deletedAt).toBeNull();
  });

  it('should always include the base columns even when the entity omits them', () => {
    const result = fromEntityToScalarEntity(
      buildArgs('permissionFlag', {
        id: 'permission-flag-id-1',
        key: 'IMPERSONATE',
        label: 'Impersonate',
        description: 'Allows impersonation',
        icon: 'IconUser',
        permissionType: 'WORKSPACE',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      }),
    );

    expect(Object.keys(result)).toEqual(
      expect.arrayContaining([
        'id',
        'workspaceId',
        'applicationId',
        'universalIdentifier',
      ]),
    );
    expect(result.workspaceId).toBeUndefined();
    expect(result.applicationId).toBeUndefined();
    expect(result.universalIdentifier).toBeUndefined();
  });
});
