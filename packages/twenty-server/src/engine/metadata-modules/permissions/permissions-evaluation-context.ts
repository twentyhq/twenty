import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type RolesFromPermissionConfig = {
  roles: RoleEntity[];
  useIntersection: boolean;
} | null;

export class PermissionsEvaluationContext {
  private readonly roleLoadPromises = new Map<
    string,
    Promise<RolesFromPermissionConfig>
  >();

  getRoles({
    rolePermissionConfig,
    workspaceId,
    relations,
    load,
  }: {
    rolePermissionConfig: RolePermissionConfig;
    workspaceId: string;
    relations: string[];
    load: () => Promise<RolesFromPermissionConfig>;
  }): Promise<RolesFromPermissionConfig> {
    const cacheKey = JSON.stringify([
      workspaceId,
      this.serializeRolePermissionConfig(rolePermissionConfig),
      [...relations].sort(),
    ]);
    const existingPromise = this.roleLoadPromises.get(cacheKey);

    if (existingPromise) {
      return existingPromise;
    }

    const loadPromise = load();

    this.roleLoadPromises.set(cacheKey, loadPromise);

    return loadPromise;
  }

  private serializeRolePermissionConfig(
    rolePermissionConfig: RolePermissionConfig,
  ): [string, string[]] {
    if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
      return ['bypass', []];
    }

    if ('intersectionOf' in rolePermissionConfig) {
      return ['intersection', [...rolePermissionConfig.intersectionOf].sort()];
    }

    return ['union', [...rolePermissionConfig.unionOf].sort()];
  }
}
