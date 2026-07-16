import { Test, type TestingModule } from '@nestjs/testing';

import { NoopReconciliationEngine } from
  'src/modules/executive-search/reconciliation/noop-reconciliation-engine';
import { ReconciliationEngineRegistry } from
  'src/modules/executive-search/reconciliation/reconciliation-engine.registry';

describe('ReconciliationEngineRegistry', () => {
  let registry: ReconciliationEngineRegistry;
  let noopEngine: NoopReconciliationEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReconciliationEngineRegistry, NoopReconciliationEngine],
    }).compile();

    registry = module.get<ReconciliationEngineRegistry>(
      ReconciliationEngineRegistry,
    );
    noopEngine = module.get<NoopReconciliationEngine>(
      NoopReconciliationEngine,
    );
  });

  it('registers an engine and retrieves it by name', () => {
    registry.register(noopEngine);

    const retrieved = registry.get('noop');

    expect(retrieved).toBe(noopEngine);
    expect(retrieved.name).toBe('noop');
  });

  it('returns the list of registered engine names', () => {
    registry.register(noopEngine);

    expect(registry.list()).toEqual(['noop']);
  });

  it('throws when retrieving an unregistered engine', () => {
    expect(() => registry.get('nonexistent')).toThrow();
  });

  describe('registered noop engine', () => {
    it('reconcile returns an empty array', async () => {
      registry.register(noopEngine);

      const findings = await noopEngine.reconcile({
        workspaceId: 'workspace-1',
        objectName: 'person',
      });

      expect(findings).toEqual([]);
    });

    it('reconcile accepts optional recordIds', async () => {
      registry.register(noopEngine);

      const findings = await noopEngine.reconcile({
        workspaceId: 'workspace-1',
        objectName: 'person',
        recordIds: ['record-1', 'record-2'],
      });

      expect(findings).toEqual([]);
    });
  });
});
