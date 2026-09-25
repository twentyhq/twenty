import { Column } from 'typeorm';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export abstract class OverridableEntity<
  TOverrides = Record<string, unknown>,
> extends SyncableEntity {
  @Column({ type: 'jsonb', nullable: true })
  overrides: JsonbProperty<AuthoredOverrides<TOverrides>> | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
