export const getAvatarInitial = (name?: string | null): string =>
  (name ?? '').trim().charAt(0).toUpperCase();
