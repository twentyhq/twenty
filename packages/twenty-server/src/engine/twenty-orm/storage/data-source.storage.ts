import { DataSource } from 'typeorm';

export class DataSourceStorage {
  private static readonly dataSources: Map<string, DataSource> = new Map();

  public static getDataSource(key: string): DataSource | undefined {
    return this.dataSources.get(key);
  }

  public static setDataSource(key: string, dataSource: DataSource): void {
    this.dataSources.set(key, dataSource);
  }

  public static getAllDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }
}
