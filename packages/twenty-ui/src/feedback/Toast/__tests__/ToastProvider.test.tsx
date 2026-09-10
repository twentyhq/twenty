import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { atom, createStore, Provider, useAtom, useAtomValue } from 'jotai';
import { expect, it, vi } from 'vitest';

import { useToast } from '../hooks/useToast';
import { ToastProvider } from '../ToastProvider';

it.each([0, -1, 1.5])('rejects an invalid toast limit of %s', (limit) => {
  expect(() => render(<ToastProvider limit={limit} />)).toThrow(
    'Toast limit must be a positive integer.',
  );
});

it('preserves the application Jotai scope inside nested toast providers', async () => {
  const user = userEvent.setup();
  const applicationStore = createStore();
  const countAtom = atom(0);
  applicationStore.set(countAtom, 5);

  const ApplicationCount = () => {
    const count = useAtomValue(countAtom);
    return <output>Application count: {count}</output>;
  };

  const IncrementCount = () => {
    const [count, setCount] = useAtom(countAtom);
    return (
      <button onClick={() => setCount(count + 1)}>
        Increment from {count}
      </button>
    );
  };

  render(
    <Provider store={applicationStore}>
      <ApplicationCount />
      <ToastProvider>
        <ToastProvider>
          <IncrementCount />
        </ToastProvider>
      </ToastProvider>
    </Provider>,
  );

  await user.click(screen.getByRole('button', { name: 'Increment from 5' }));

  expect(screen.getByText('Application count: 6')).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Increment from 6' }),
  ).toBeVisible();
});

it('deduplicates consecutive enqueues and applies the provider limit synchronously', () => {
  const { result } = renderHook(() => useToast(), {
    wrapper: ({ children }) => (
      <ToastProvider limit={1}>{children}</ToastProvider>
    ),
  });
  const onClose = vi.fn();
  const { enqueueToast, close } = result.current;

  const firstId: string = enqueueToast({ dedupeKey: 'saved', onClose });
  expect(enqueueToast({ dedupeKey: 'saved' })).toBe(firstId);
  expect(enqueueToast(undefined)).toBeUndefined();
  expect(onClose).not.toHaveBeenCalled();

  enqueueToast({ children: 'Next notification' });
  expect(onClose).toHaveBeenCalledOnce();
  close(firstId);
  expect(onClose).toHaveBeenCalledOnce();
});
