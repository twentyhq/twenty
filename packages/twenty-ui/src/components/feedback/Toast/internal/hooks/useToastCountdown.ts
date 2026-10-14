import { useState } from 'react';

import { createToastCountdown } from '../utils/createToastCountdown';

export const useToastCountdown = ({
  duration,
  isPaused,
}: {
  duration: number;
  isPaused: boolean;
}) => {
  const [countdown, setCountdown] = useState({
    duration,
    remainingDuration: duration,
    revision: 0,
    isPaused,
  });
  const [clock] = useState(() =>
    createToastCountdown({ onChange: setCountdown }),
  );

  return { countdown, clock };
};
