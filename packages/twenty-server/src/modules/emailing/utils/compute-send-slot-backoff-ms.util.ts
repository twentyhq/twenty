import { SEND_SLOT_RETRY } from 'src/engine/core-modules/emailing-domain/constants/send-slot-retry.constant';

export const computeSendSlotBackoffMs = ({
  attemptCount,
  retryDelayMs,
  windowMs,
}: {
  attemptCount: number;
  retryDelayMs: number;
  windowMs: number;
}): number => {
  const backoffCeilingMs = Math.min(
    windowMs * SEND_SLOT_RETRY.maxWindows,
    SEND_SLOT_RETRY.maxDelayMs,
  );

  const backoffMs = Math.min(
    retryDelayMs * 2 ** (attemptCount - 1),
    Math.max(backoffCeilingMs, SEND_SLOT_RETRY.minDelayMs),
  );

  return Math.ceil(
    backoffMs * (1 + Math.random() * SEND_SLOT_RETRY.jitterRatio),
  );
};
