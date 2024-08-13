import { EntitySchema } from 'typeorm';

export class WorkspaceEntitiesStorage {
  private static workspaceEntities = new Map<
    string,
    Map<string, EntitySchema>
  >();

  static getEntitySchema(
    workspaceId: string,
    objectMetadataName: string,
  ): EntitySchema | undefined {
    const workspace = this.workspaceEntities.get(workspaceId);

    return workspace?.get(objectMetadataName);
  }

  static setEntitySchema(
    workspaceId: string,
    objectMetadataName: string,
    schema: EntitySchema,
  ): void {
    if (!this.workspaceEntities.has(workspaceId)) {
      this.workspaceEntities.set(workspaceId, new Map<string, EntitySchema>());
    }
    const workspace = this.workspaceEntities.get(workspaceId);

    workspace?.set(objectMetadataName, schema);
  }

  static getObjectMetadataName(
    workspaceId: string,
    target: EntitySchema,
  ): string | undefined {
    const workspace = this.workspaceEntities.get(workspaceId);

    return Array.from(workspace?.entries() || []).find(
      ([, schema]) => schema.options.name === target.options.name,
    )?.[0];
  }

  static getEntities(workspaceId: string): EntitySchema[] {
    return Array.from(this.workspaceEntities.get(workspaceId)?.values() || []);
  }

  static clearWorkspace(workspaceId: string): void {
    this.workspaceEntities.delete(workspaceId);
  }
}
