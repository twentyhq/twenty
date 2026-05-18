import { type UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';

export class UpgradeAwareRepositoryState {
  private static singleton: UpgradeAwareRepositoryState | null = null;

  private metadataService: UpgradeAwareEntityMetadataAdapter | null = null;

  static getInstance(): UpgradeAwareRepositoryState {
    if (this.singleton === null) {
      this.singleton = new UpgradeAwareRepositoryState();
    }

    return this.singleton;
  }

  setMetadataService(service: UpgradeAwareEntityMetadataAdapter): void {
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
