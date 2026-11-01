import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createToastCountdown } from '../createToastCountdown';

const DEFAULT_CONFIGURATION = {
  duration: 1000,
  durationRevision: 0,
  isPaused: false,
  isProgress: false,
  isActive: true,
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

it('preserves the original expiry through repeated unchanged updates and uses the latest callback', () => {
  const onChange = vi.fn();
  const onClose = vi.fn();
  const updatedClose = vi.fn();
  const countdown = createToastCountdown({ onChange });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose: updatedClose });
  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose: updatedClose });
  expect(onChange).toHaveBeenCalledOnce();
  vi.advanceTimersByTime(199);
  expect(updatedClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(updatedClose).toHaveBeenCalledOnce();
  expect(onClose).not.toHaveBeenCalled();
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ remainingDuration: 0 }),
  );
});

it.each([
  { state: 'persistent', configuration: { duration: 0 } },
  { state: 'inactive', configuration: { isActive: false } },
])(
  'keeps unchanged $state snapshots while refreshing the close callback',
  ({ configuration }) => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const updatedClose = vi.fn();
    const countdown = createToastCountdown({ onChange });
    countdown.update({ ...DEFAULT_CONFIGURATION, ...configuration, onClose });

    vi.advanceTimersByTime(400);
    countdown.update({
      ...DEFAULT_CONFIGURATION,
      ...configuration,
      onClose: updatedClose,
    });

    expect(onChange).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    countdown.close();
    expect(updatedClose).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  },
);

it('restarts every explicit duration revision even when the duration stays unchanged', () => {
  const onChange = vi.fn();
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 1,
    onClose,
  });
  vi.advanceTimersByTime(400);
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 2,
    onClose,
  });
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ duration: 1000, remainingDuration: 1000 }),
  );
  vi.advanceTimersByTime(999);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});

it('starts a fresh countdown when the duration prop changes', () => {
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange: vi.fn() });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, duration: 600, onClose });
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});

it('cancels obsolete expiry when duration becomes zero and starts fresh when persistence ends', () => {
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange: vi.fn() });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, duration: 0, onClose });
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(10_000);
  countdown.update({ ...DEFAULT_CONFIGURATION, duration: 0, onClose });
  expect(onClose).not.toHaveBeenCalled();
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });
  vi.advanceTimersByTime(999);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});

it('disables expiry throughout progress updates and starts the latest full duration on leaving progress', () => {
  const onChange = vi.fn();
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, isProgress: true, onClose });
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(10_000);
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    duration: 600,
    durationRevision: 1,
    isProgress: true,
    onClose,
  });
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    duration: 600,
    durationRevision: 1,
    onClose,
  });
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ remainingDuration: 600 }),
  );
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});

it('keeps zero-duration notifications persistent after leaving progress', () => {
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange: vi.fn() });
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    duration: 0,
    isProgress: true,
    onClose,
  });
  countdown.update({ ...DEFAULT_CONFIGURATION, duration: 0, onClose });
  vi.advanceTimersByTime(10_000);

  expect(onClose).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it('preserves remaining time through repeated paused updates and resumes from that remainder', () => {
  const onChange = vi.fn();
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, isPaused: true, onClose });
  vi.advanceTimersByTime(10_000);
  countdown.update({ ...DEFAULT_CONFIGURATION, isPaused: true, onClose });
  vi.advanceTimersByTime(10_000);
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ remainingDuration: 600, isPaused: true }),
  );
  expect(onClose).not.toHaveBeenCalled();
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});

it('keeps restarted duration and progress-exit countdowns suspended while paused', () => {
  const onChange = vi.fn();
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, isPaused: true, onClose });
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 1,
    isPaused: true,
    onClose,
  });
  vi.advanceTimersByTime(10_000);
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ remainingDuration: 1000, isPaused: true }),
  );
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 1,
    isPaused: true,
    isProgress: true,
    onClose,
  });
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 1,
    isPaused: true,
    onClose,
  });
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 1,
    onClose,
  });
  vi.advanceTimersByTime(999);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});

it.each([
  { mode: 'paused', isPaused: true, isProgress: false },
  { mode: 'progress', isPaused: false, isProgress: true },
])(
  'updates the callback without republishing an unchanged $mode snapshot',
  ({ isPaused, isProgress }) => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const updatedClose = vi.fn();
    const countdown = createToastCountdown({ onChange });
    countdown.update({
      ...DEFAULT_CONFIGURATION,
      isPaused,
      isProgress,
      onClose,
    });
    onChange.mockClear();

    countdown.update({
      ...DEFAULT_CONFIGURATION,
      isPaused,
      isProgress,
      onClose: updatedClose,
    });

    expect(onChange).not.toHaveBeenCalled();
    countdown.close();
    expect(updatedClose).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  },
);

it('dismisses manually once and prevents later updates from reviving expiry', () => {
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange: vi.fn() });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.close();
  countdown.close();
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 1,
    onClose,
  });
  vi.advanceTimersByTime(10_000);

  expect(onClose).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it('cancels expiry when the toast becomes inactive', () => {
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange: vi.fn() });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.update({ ...DEFAULT_CONFIGURATION, isActive: false, onClose });
  countdown.update({
    ...DEFAULT_CONFIGURATION,
    durationRevision: 1,
    isActive: false,
    onClose,
  });
  vi.advanceTimersByTime(10_000);

  expect(onClose).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it('stops scheduled work without dismissing and can resume after effect setup runs again', () => {
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange: vi.fn() });
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });

  vi.advanceTimersByTime(400);
  countdown.stop();
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();
  countdown.update({ ...DEFAULT_CONFIGURATION, onClose });
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});

it('schedules long durations in safe chunks without expiring early', () => {
  const onClose = vi.fn();
  const countdown = createToastCountdown({ onChange: vi.fn() });
  const duration = 2 ** 31 + 500;
  countdown.update({ ...DEFAULT_CONFIGURATION, duration, onClose });

  vi.advanceTimersByTime(2 ** 31 - 1);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(500);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);

  expect(onClose).toHaveBeenCalledOnce();
});
