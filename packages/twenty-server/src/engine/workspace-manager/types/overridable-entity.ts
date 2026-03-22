import { Column } from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export abstract class OverridableEntity<
  TOverrides = Record<string, unknown>,
> extends SyncableEntity {
  @Column({ type: 'jsonb', nullable: true })
  overrides: JsonbProperty<TOverrides> | null;
}
