import {
  type ConnectedAccountProvider,
  type EmailConnectionParameters,
} from '@/types';

export type ConnectedAccountEmailFields = {
  provider: ConnectedAccountProvider;
  connectionParameters?: EmailConnectionParameters | null;
  scopes: string[] | null;
};
