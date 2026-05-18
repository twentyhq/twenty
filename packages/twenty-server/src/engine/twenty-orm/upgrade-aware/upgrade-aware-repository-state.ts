import { type UpgradeAwareEntityMetadataService } from 'src/engine/twenty-orm/services/upgrade-aware-entity-metadata.service';

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
