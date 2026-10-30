import { isDefined } from '@ui/utilities/utils/isDefined';

import { isCountdownDuration } from './isCountdownDuration';

type CountdownConfiguration = {
  duration: number;
  durationRevision: number;
  isPaused: boolean;
  isProgress: boolean;
  isActive: boolean;
  onClose?: () => void;
};

type CountdownSnapshot = {
  duration: number;
  remainingDuration: number;
  revision: number;
  isPaused: boolean;
};

const MAX_TIMEOUT_DURATION = 2 ** 31 - 1;

export const createToastCountdown = ({
  onChange,
}: {
  onChange: (snapshot: CountdownSnapshot) => void;
}) => {
  let configuration: CountdownConfiguration | undefined;
  let remainingDuration = 0;
  let startedAt: number | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let revision = 0;
  let timerRevision = 0;
  let isClosed = false;

  const stop = () => {
    timerRevision += 1;
    if (isDefined(startedAt)) {
      remainingDuration = Math.max(
        0,
        remainingDuration - (performance.now() - startedAt),
      );
      startedAt = undefined;
    }

    clearTimeout(timeout);
    timeout = undefined;
  };

  const publish = () => {
    if (!isDefined(configuration)) {
      return;
    }

    revision += 1;
    onChange({
      duration: configuration.duration,
      remainingDuration,
      revision,
      isPaused: configuration.isPaused || !configuration.isActive,
    });
  };

  const close = () => {
    if (isClosed) {
      return;
    }

    stop();
    isClosed = true;
    remainingDuration = 0;
    publish();
    configuration?.onClose?.();
  };

  const isCountdownEnabled = () =>
    isDefined(configuration) &&
    configuration.isActive &&
    !configuration.isPaused &&
    !configuration.isProgress &&
    isCountdownDuration(configuration.duration) &&
    !isClosed;

  const start = () => {
    if (!isCountdownEnabled()) {
      return;
    }

    startedAt = performance.now();
    const scheduledRevision = timerRevision;
    timeout = setTimeout(
      () => {
        if (scheduledRevision !== timerRevision) {
          return;
        }

        stop();

        if (remainingDuration > 0) {
          start();
          return;
        }

        close();
      },
      Math.min(remainingDuration, MAX_TIMEOUT_DURATION),
    );
  };

  const update = (nextConfiguration: CountdownConfiguration) => {
    const shouldRestart =
      !isDefined(configuration) ||
      nextConfiguration.duration !== configuration.duration ||
      nextConfiguration.durationRevision !== configuration.durationRevision ||
      (configuration.isProgress && !nextConfiguration.isProgress);
    const hasTimingChanged =
      shouldRestart ||
      nextConfiguration.isProgress !== configuration?.isProgress ||
      nextConfiguration.isPaused !== configuration?.isPaused ||
      nextConfiguration.isActive !== configuration?.isActive;

    const shouldResume = !isDefined(startedAt) && isCountdownEnabled();

    if (!hasTimingChanged && !shouldResume) {
      configuration = nextConfiguration;
      return;
    }

    stop();
    configuration = nextConfiguration;

    if (isClosed) {
      return;
    }

    if (shouldRestart) {
      remainingDuration = Math.max(0, nextConfiguration.duration);
    }

    publish();
    start();
  };

  return { update, close, stop };
};
