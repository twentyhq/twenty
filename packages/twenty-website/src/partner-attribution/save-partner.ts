import { PARTNER_STORAGE_KEY } from './partner-storage-key';

export const savePartner = (partner: string): void => {
  try {
    sessionStorage.setItem(PARTNER_STORAGE_KEY, partner);
  } catch {
    return;
  }
};
