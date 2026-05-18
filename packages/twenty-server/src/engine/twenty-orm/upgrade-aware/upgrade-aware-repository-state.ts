import { type UpgradeAwareEntityMetadataService } from 'src/engine/twenty-orm/services/upgrade-aware-entity-metadata.service';

// Module-level holder that lets the DataSource-level repository guard query
// per-entity availability without depending on NestJS DI ordering.
//
// `installUpgradeAwareRepositoryGuard` runs at TypeOrmModule.forRoot
// resolution time — earlier than `UpgradeAwareEntityMetadataService` can
// possibly exist. The guard captures this state, and the metadata service
// installs itself on `onModuleInit`. Before installation, every entity is
// reported as available so the guard is a strict no-op.

export class UpgradeAwareRepositoryState {
  private static singleton: UpgradeAwareRepositoryState | null = null;

  private metadataService: UpgradeAwareEntityMetadataService | null = null;

  static getInstance(): UpgradeAwareRepositoryState {
    if (this.singleton === null) {
      this.singleton = new UpgradeAwareRepositoryState();
    }

    return this.singleton;
  }

  setMetadataService(service: UpgradeAwareEntityMetadataService): void {
    this.metadataService = service;
  }

  isEntityAvailable(entityClass: Function): boolean {
    if (this.metadataService === null) {
      return true;
    }

    return this.metadataService.isEntityAvailable(entityClass);
  }

  getHiddenColumnPropertyNames(
    entityClass: Function,
  ): ReadonlySet<string> {
    if (this.metadataService === null) {
      return new Set();
    }

    return this.metadataService.getHiddenColumnPropertyNames(entityClass);
  }
}
