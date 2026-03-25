export type SnackBarVariant = 'error' | 'success' | 'info' | 'warning';

export type EnqueueSnackbarParams = {
  message: string;
  variant: SnackBarVariant;
  duration?: number;
  detailedMessage?: string;
  dedupeKey?: string;
};
