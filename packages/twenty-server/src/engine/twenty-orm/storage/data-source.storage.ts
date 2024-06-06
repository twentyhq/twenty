import { DataSource } from 'typeorm';

import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';

export class DataSourceStorage {
  private static readonly dataSources: Map<string, WorkspaceDataSource> =
    new Map();

  public static getDataSource(key: string): WorkspaceDataSource | undefined {
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
