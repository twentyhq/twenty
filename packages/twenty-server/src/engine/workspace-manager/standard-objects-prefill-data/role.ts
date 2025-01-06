import { Permission } from 'src/engine/core-modules/permission/permission.entity';
import { Role } from 'src/engine/core-modules/role/role.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { EntityManager } from 'typeorm';

export const rolePrefillData = async (
  entityManager: EntityManager,
  objectMetadataEntity: ObjectMetadataEntity[],
) => {
  const workspaceId = objectMetadataEntity[0].workspaceId
  const workspace = await entityManager
    .createQueryBuilder(Workspace, 'workspace')
    .where('workspace.id = :workspaceId', { workspaceId })
    .getOne();

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  const roles = [
    {
      name: 'Manager',
      description: 'Can modify all app settings, grant app roles, create test apps, users, and pages, test all permissions, features, and products, and view app insights.',
      canAccessWorkspaceSettings: true,
      isActive: true,
      isCustom: false,
      icon: "IconId",
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: workspace, 
      permissions: objectMetadataEntity.map((obj) => ({
        tableName: obj.labelPlural,
        canCreate: true,
        canEdit: true,
        canView: true,
        canDelete: true,
      }))
    },
    {
      name: 'Support',
      description: 'Can modify all app settings, grant app roles, create test apps, users, and pages, test all permissions, features, and products, and view app insights.',
      canAccessWorkspaceSettings: false,
      isActive: true,
      isCustom: false,
      icon: "IconPhone",
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: workspace, 
      permissions: objectMetadataEntity.map((obj) => ({
        tableName: obj.labelPlural,
        canCreate: false,
        canEdit: false,
        canView: true,
        canDelete: false,
      }))
    },
    {
      name: 'Sales',
      description: 'Can modify all app settings, grant app roles, create test apps, users, and pages, test all permissions, features, and products, and view app insights.',
      canAccessWorkspaceSettings: false,
      isActive: true,
      isCustom: false,
      icon: "IconTag",
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: workspace, 
      permissions: objectMetadataEntity.map((obj) => ({
        tableName: obj.labelPlural,
        canCreate: true,
        canEdit: true,
        canView: true,
        canDelete: false,
      }))
    },
  ];

  for (const roleData of roles) {
    const role = new Role();
    Object.assign(role, roleData);
    const savedRole = await entityManager.save(role);

    if(savedRole.name === 'Manager'){
      const userWorkspaces = await entityManager
      .createQueryBuilder(UserWorkspace, 'userWorkspace')
      .where('userWorkspace.workspaceId = :workspaceId', { workspaceId })
      .getMany()
      for (let userWorkspace of userWorkspaces) {
        await entityManager
        .createQueryBuilder()
        .update(UserWorkspace)
        .set({ role: savedRole.id })
        .where('workspaceId = :workspaceId', { workspaceId })
        .andWhere('id = :id', { id: userWorkspace.id })
        .execute();
      }
    }

    const permissions = roleData.permissions.map(permissionData => {
      const permission = new Permission();
      Object.assign(permission, permissionData);
      permission.role = savedRole;
      return permission;
    });
    await entityManager.save(Permission, permissions);
  }
};