export const formatDuration = (ms: number): string => {
  const minutes = Math.round(ms / (60 * 1000));

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.round(ms / (60 * 60 * 1000));

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  const days = Math.round(ms / (24 * 60 * 60 * 1000));

  return `${days} day${days !== 1 ? 's' : ''}`;
};
