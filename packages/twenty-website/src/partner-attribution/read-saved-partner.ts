import { PARTNER_STORAGE_KEY } from './partner-storage-key';

export const readSavedPartner = (): string | undefined => {
  try {
    return sessionStorage.getItem(PARTNER_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};
