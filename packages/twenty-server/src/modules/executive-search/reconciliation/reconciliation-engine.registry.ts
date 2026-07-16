import { Injectable, NotFoundException } from '@nestjs/common';

import type { ReconciliationEngine } from
  'src/modules/executive-search/reconciliation/reconciliation-engine.interface';

@Injectable()
export class ReconciliationEngineRegistry {
  private readonly engines = new Map<string, ReconciliationEngine>();

  register(engine: ReconciliationEngine): void {
    this.engines.set(engine.name, engine);
  }

  get(name: string): ReconciliationEngine {
    const engine = this.engines.get(name);

    if (!engine) {
      throw new NotFoundException(
        `Reconciliation engine "${name}" not found`,
      );
    }

    return engine;
  }

  list(): string[] {
    return Array.from(this.engines.keys());
  }
}
