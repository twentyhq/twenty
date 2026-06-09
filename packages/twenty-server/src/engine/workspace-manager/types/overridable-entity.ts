import { Column } from 'typeorm';

import { SystemSideEffectEntity } from 'src/engine/workspace-manager/types/system-side-effect-entity';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export abstract class OverridableEntity<
  TOverrides = Record<string, unknown>,
> extends SystemSideEffectEntity {
  @Column({ type: 'jsonb', nullable: true })
  overrides: JsonbProperty<TOverrides> | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
