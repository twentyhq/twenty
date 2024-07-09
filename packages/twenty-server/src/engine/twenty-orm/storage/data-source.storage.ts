import { DataSource } from 'typeorm';

import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';

export class DataSourceStorage {
  private static readonly dataSources: Map<string, WorkspaceDataSource> =
    new Map();

  public static getDataSource(key: string): WorkspaceDataSource | undefined {
    // Destroy all data sources that belong to the workspace if the cache version change
    for (const [dataSourceKey, dataSource] of this.dataSources.entries()) {
      const workspaceId = key.split('-')?.[0];

      if (workspaceId && dataSourceKey.startsWith(workspaceId)) {
        dataSource.destroy();
        this.dataSources.delete(dataSourceKey);
      }
    }

    return this.dataSources.get(key);
  }

  public static setDataSource(
    key: string,
    dataSource: WorkspaceDataSource,
  ): void {
    this.dataSources.set(key, dataSource);
  }

  public static getAllDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }
}
