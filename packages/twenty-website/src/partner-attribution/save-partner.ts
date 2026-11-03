import { PARTNER_STORAGE_KEY } from './partner-storage-key';

export const savePartner = ({
  storage,
  code,
  now,
}: {
  storage: Storage;
  code: string;
  now: number;
}) => {
  storage.setItem(PARTNER_STORAGE_KEY, JSON.stringify({ code, savedAt: now }));
};
