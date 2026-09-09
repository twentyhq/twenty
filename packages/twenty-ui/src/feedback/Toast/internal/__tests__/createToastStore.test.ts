import { afterEach, expect, it, vi } from 'vitest';

import { createToastStore } from '../createToastStore';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('queues distinct notifications when randomUUID is unavailable', () => {
  vi.stubGlobal('crypto', {
    getRandomValues: crypto.getRandomValues.bind(crypto),
  });
  const store = createToastStore();

  const firstId = store.add({ children: 'First notification' }, 3);
  const secondId = store.add({ children: 'Second notification' }, 3);

  expect(firstId).toBeTruthy();
  expect(secondId).not.toBe(firstId);
  expect(store.getSnapshot()).toEqual([
    { id: firstId, children: 'First notification' },
    { id: secondId, children: 'Second notification' },
  ]);
});
