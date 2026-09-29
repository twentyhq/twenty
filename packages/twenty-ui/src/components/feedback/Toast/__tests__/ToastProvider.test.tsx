import { render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { Toaster } from '../../Toaster/Toaster';
import { ToastProvider } from '../ToastProvider';
import { useToast } from '../hooks/useToast';

const ToastControls = ({ source }: { source: string }) => {
  const { enqueueToast, closeToast } = useToast();

  return (
    <>
      <button
        onClick={() =>
          enqueueToast({
            dedupeKey: 'saved',
            children: `${source} notification`,
          })
        }
      >
        Add {source}
      </button>
      <button onClick={() => closeToast()}>Close {source}</button>
    </>
  );
};

it.each([0, -1, 1.5])('rejects an invalid toast limit of %s', (limit) => {
  expect(() => render(<ToastProvider limit={limit} />)).toThrow(
    'Toast limit must be a positive integer.',
  );
});

it('isolates nested provider queues and deduplication', async () => {
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <ToastControls source="Parent" />
      <Toaster aria-label="Parent notifications" />
      <ToastProvider>
        <ToastControls source="Child" />
        <Toaster aria-label="Child notifications" />
      </ToastProvider>
    </ToastProvider>,
  );
  const parent = within(
    screen.getByRole('region', { name: 'Parent notifications' }),
  );
  const child = within(
    screen.getByRole('region', { name: 'Child notifications' }),
  );

  await user.click(screen.getByRole('button', { name: 'Add Parent' }));
  await user.click(screen.getByRole('button', { name: 'Add Child' }));

  expect(parent.getByRole('status')).toHaveTextContent('Parent notification');
  expect(child.getByRole('status')).toHaveTextContent('Child notification');

  await user.click(screen.getByRole('button', { name: 'Close Child' }));

  expect(child.queryByRole('status')).not.toBeInTheDocument();
  expect(parent.getByRole('status')).toHaveTextContent('Parent notification');
});

it('deduplicates consecutive enqueues and applies the provider limit synchronously', () => {
  const { result } = renderHook(() => useToast(), {
    wrapper: ({ children }) => (
      <ToastProvider limit={1}>{children}</ToastProvider>
    ),
  });
  const onClose = vi.fn();
  const { enqueueToast, closeToast } = result.current;

  const firstId: string = enqueueToast({ dedupeKey: 'saved', onClose });
  expect(enqueueToast({ dedupeKey: 'saved' })).toBe(firstId);
  expect(enqueueToast(undefined)).toBeUndefined();
  expect(onClose).not.toHaveBeenCalled();

  enqueueToast({ children: 'Next notification' });
  expect(onClose).toHaveBeenCalledOnce();
  closeToast(firstId);
  expect(onClose).toHaveBeenCalledOnce();
});
