import { createWebGlContextBudget } from './create-webgl-context-budget';

type ScheduledJob = { callback: () => void };

// Deterministic host: grants sit in a queue until the test drains them.
function createFakeHost() {
  const jobs: ScheduledJob[] = [];
  return {
    host: {
      setTimeout: (callback: () => void) => {
        const job = { callback };
        jobs.push(job);
        return jobs.length;
      },
      clearTimeout: (handle: number) => {
        const job = jobs[handle - 1];
        if (job) {
          job.callback = () => {};
        }
      },
    },
    drain: () => {
      while (jobs.length > 0) {
        const job = jobs.shift();
        job?.callback();
      }
    },
    drainOne: () => {
      const job = jobs.shift();
      job?.callback();
    },
  };
}

describe('createWebGlContextBudget', () => {
  it('should grant up to maxActive and queue the rest', () => {
    const { host, drain } = createFakeHost();
    const budget = createWebGlContextBudget({ maxActive: 2, host });
    const granted: number[] = [];

    budget.request({ onGranted: () => granted.push(1) });
    budget.request({ onGranted: () => granted.push(2) });
    budget.request({ onGranted: () => granted.push(3) });
    drain();

    expect(granted).toEqual([1, 2]);
    expect(budget.getActiveCount()).toBe(2);
    expect(budget.getPendingCount()).toBe(1);
  });

  it('should grant a queued request when a held slot settles', () => {
    const { host, drain } = createFakeHost();
    const budget = createWebGlContextBudget({ maxActive: 1, host });
    const granted: string[] = [];

    const settleA = budget.request({ onGranted: () => granted.push('a') });
    budget.request({ onGranted: () => granted.push('b') });
    drain();
    expect(granted).toEqual(['a']);

    settleA();
    drain();
    expect(granted).toEqual(['a', 'b']);
    expect(budget.getActiveCount()).toBe(1);
  });

  it('REGRESSION (acquire race): a slot released while another consumer is between try and subscribe is never missed', () => {
    // The old engine's consumer did tryAcquire() then subscribed; a release
    // in the gap was lost. Here the queue owns the request from the first
    // call, so the release always reaches it.
    const { host, drain } = createFakeHost();
    const budget = createWebGlContextBudget({ maxActive: 1, host });
    const granted: string[] = [];

    const settleA = budget.request({ onGranted: () => granted.push('a') });
    drain();

    // B requests and, before any scheduler runs, A releases (the old gap).
    budget.request({ onGranted: () => granted.push('b') });
    settleA();
    drain();

    expect(granted).toEqual(['a', 'b']);
    expect(budget.getActiveCount()).toBe(1);
    expect(budget.getPendingCount()).toBe(0);
  });

  it("REGRESSION (dispose double-release): a stale settle can never release the next epoch's slot", () => {
    // Old engine: context-lost remounted by key; the old instance's cleanup
    // released a slot the new instance had already acquired, corrupting the
    // counter. Token-owned release makes the second settle a no-op.
    const { host, drain } = createFakeHost();
    const budget = createWebGlContextBudget({ maxActive: 1, host });
    const granted: string[] = [];

    const settleOldEpoch = budget.request({
      onGranted: () => granted.push('old'),
    });
    drain();

    // Context lost: old epoch settles, new epoch requests and is granted.
    settleOldEpoch();
    const settleNewEpoch = budget.request({
      onGranted: () => granted.push('new'),
    });
    drain();
    expect(granted).toEqual(['old', 'new']);
    expect(budget.getActiveCount()).toBe(1);

    // The stale cleanup fires again (and again) — must not free 'new'.
    settleOldEpoch();
    settleOldEpoch();
    expect(budget.getActiveCount()).toBe(1);
    expect(budget.getPendingCount()).toBe(0);

    settleNewEpoch();
    expect(budget.getActiveCount()).toBe(0);
  });

  it('should never exceed maxActive across fuzzed interleavings', () => {
    const { host, drainOne } = createFakeHost();
    const budget = createWebGlContextBudget({ maxActive: 3, host });
    const settles: Array<() => void> = [];
    let maxObserved = 0;

    // Deterministic pseudo-random interleaving of request/settle/drain.
    let seed = 42;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };

    for (let step = 0; step < 500; step += 1) {
      const roll = random();
      if (roll < 0.4) {
        settles.push(budget.request({ onGranted: () => {} }));
      } else if (roll < 0.7 && settles.length > 0) {
        const index = Math.floor(random() * settles.length);
        settles[index]();
        // Occasionally double-settle to probe idempotence.
        if (random() < 0.3) {
          settles[index]();
        }
        settles.splice(index, 1);
      } else {
        drainOne();
      }
      maxObserved = Math.max(maxObserved, budget.getActiveCount());
      expect(budget.getActiveCount()).toBeGreaterThanOrEqual(0);
    }

    expect(maxObserved).toBeLessThanOrEqual(3);
  });

  it('should settle a pending request without it ever granting', () => {
    const { host, drain } = createFakeHost();
    const budget = createWebGlContextBudget({ maxActive: 1, host });
    const granted: string[] = [];

    budget.request({ onGranted: () => granted.push('a') });
    const settleB = budget.request({ onGranted: () => granted.push('b') });
    settleB();
    drain();

    expect(granted).toEqual(['a']);
    expect(budget.getPendingCount()).toBe(0);
  });

  it('should drain the priority class before normal, FIFO within class', () => {
    const { host, drain } = createFakeHost();
    const budget = createWebGlContextBudget({ maxActive: 4, host });
    const granted: string[] = [];

    budget.request({ onGranted: () => granted.push('n1') });
    budget.request({ onGranted: () => granted.push('n2') });
    budget.request({
      priority: 'priority',
      onGranted: () => granted.push('p1'),
    });
    budget.request({
      priority: 'priority',
      onGranted: () => granted.push('p2'),
    });
    drain();

    expect(granted).toEqual(['p1', 'p2', 'n1', 'n2']);
  });
});
