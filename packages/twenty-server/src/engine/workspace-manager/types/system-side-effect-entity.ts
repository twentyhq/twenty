import { Column } from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

export abstract class SystemSideEffectEntity extends SyncableEntity {
  @Column({ type: 'boolean', default: false })
  isSystemSideEffect: boolean;
}
