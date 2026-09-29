import { act, renderHook, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { expect, it, vi } from 'vitest';

import { Toaster } from '../../../Toaster/Toaster';
import { ToastProvider } from '../../ToastProvider';
import { useToast } from '../useToast';

const renderToastHook = ({ limit = 3 } = {}) =>
  renderHook(() => useToast(), {
    wrapper: ({ children }) => (
      <ToastProvider limit={limit}>
        {children}
        <Toaster />
      </ToastProvider>
    ),
  });

it('does not repeat an enqueue effect when its consumer rerenders', () => {
  const { rerender } = renderHook(
    () => {
      const { enqueueToast } = useToast();

      useEffect(() => {
        enqueueToast({ children: 'Saved' });
      }, [enqueueToast]);
    },
    {
      wrapper: ({ children }) => (
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      ),
    },
  );

  rerender();

  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Saved');
});

it('updates the toaster without rerendering action consumers', () => {
  const renderActions = vi.fn();
  const { result } = renderHook(
    () => {
      renderActions();
      return useToast();
    },
    {
      wrapper: ({ children }) => (
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      ),
    },
  );
  const initialRenderCount = renderActions.mock.calls.length;

  act(() => {
    result.current.enqueueToast({ children: 'Saved' });
  });

  expect(screen.getByRole('status')).toHaveTextContent('Saved');
  expect(renderActions).toHaveBeenCalledTimes(initialRenderCount);
});

it('generates distinct ids for each new notification', () => {
  const { result } = renderToastHook();

  act(() => {
    const firstId = result.current.enqueueToast({
      children: 'First notification',
    });
    const secondId = result.current.enqueueToast({
      children: 'Second notification',
    });

    expect(firstId).toBeTruthy();
    expect(secondId).not.toBe(firstId);
  });

  expect(screen.getAllByRole('status')).toHaveLength(2);
});

it('ignores undefined options without evicting a toast', () => {
  const { result } = renderToastHook({ limit: 1 });
  const onClose = vi.fn();

  act(() => {
    result.current.enqueueToast({ children: 'Saved', onClose });
  });

  act(() => {
    expect(result.current.enqueueToast(undefined)).toBeUndefined();
  });

  expect(screen.getByRole('status')).toHaveTextContent('Saved');
  expect(onClose).not.toHaveBeenCalled();
});

it('deduplicates visible notifications without updating their content', () => {
  const { result } = renderToastHook();

  act(() => {
    const id = result.current.enqueueToast({
      dedupeKey: 'record',
      children: 'Saved',
    });

    expect(
      result.current.enqueueToast({ dedupeKey: 'record', children: 'Changed' }),
    ).toBe(id);
  });

  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Saved');
});

it('calls each close callback once and ignores unknown dismissals', () => {
  const { result } = renderToastHook();
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  let firstId: string;

  act(() => {
    firstId = result.current.enqueueToast({
      children: 'First',
      onClose: onFirstClose,
    });
    result.current.enqueueToast({
      children: 'Second',
      onClose: onSecondClose,
    });
    result.current.closeToast('unknown');
  });

  expect(onFirstClose).not.toHaveBeenCalled();
  expect(onSecondClose).not.toHaveBeenCalled();

  act(() => {
    result.current.closeToast(firstId);
    result.current.closeToast(firstId);
  });

  expect(screen.getByRole('status')).toHaveTextContent('Second');
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).not.toHaveBeenCalled();

  act(() => {
    result.current.closeToast();
    result.current.closeToast();
  });

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
});

it('can restore a notification from its close callback', () => {
  const { result } = renderToastHook();
  const onClose = vi.fn(() => {
    result.current.enqueueToast({ dedupeKey: 'saved', children: 'Restored' });
  });

  act(() => {
    result.current.enqueueToast({ dedupeKey: 'saved', onClose });
    result.current.closeToast();
  });

  expect(screen.getByRole('status')).toHaveTextContent('Restored');
  expect(onClose).toHaveBeenCalledOnce();
});

it('preserves queue limits when an eviction callback enqueues a toast', () => {
  const { result } = renderToastHook({ limit: 1 });
  const onFirstClose = vi.fn(() => {
    result.current.enqueueToast({ children: 'Third' });
  });
  const onSecondClose = vi.fn();

  act(() => {
    result.current.enqueueToast({ children: 'First', onClose: onFirstClose });
    result.current.enqueueToast({ children: 'Second', onClose: onSecondClose });
  });

  expect(screen.getByRole('status')).toHaveTextContent('Third');
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
});

it('dismisses notifications without a mounted toaster', () => {
  const { result } = renderHook(() => useToast(), {
    wrapper: ToastProvider,
  });
  const onClose = vi.fn();
  const firstId = result.current.enqueueToast({
    dedupeKey: 'saved',
    onClose,
  });

  result.current.closeToast(firstId);
  result.current.closeToast(firstId);

  expect(onClose).toHaveBeenCalledOnce();
  expect(
    result.current.enqueueToast({ dedupeKey: 'saved', children: 'Restored' }),
  ).not.toBe(firstId);
});
