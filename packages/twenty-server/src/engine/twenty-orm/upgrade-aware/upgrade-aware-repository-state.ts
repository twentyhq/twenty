import { isDefined } from 'twenty-shared/utils';

import { type UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';

export class UpgradeAwareRepositoryState {
  private static singleton: UpgradeAwareRepositoryState | undefined;

  private metadataService: UpgradeAwareEntityMetadataAdapter | undefined;

  static getInstance(): UpgradeAwareRepositoryState {
    if (!isDefined(this.singleton)) {
      this.singleton = new UpgradeAwareRepositoryState();
    }

    return this.singleton;
  }

  setMetadataService(service: UpgradeAwareEntityMetadataAdapter): void {
    this.metadataService = service;
  }

  isEntityAvailable(entityClass: Function): boolean {
    if (!isDefined(this.metadataService)) {
      return true;
    }

    return this.metadataService.isEntityAvailable(entityClass);
  }

  getHiddenColumnPropertyNames(entityClass: Function): ReadonlySet<string> {
    if (!isDefined(this.metadataService)) {
      return new Set();
    }

    return this.metadataService.getHiddenColumnPropertyNames(entityClass);
  }
}
