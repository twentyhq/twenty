import {
  type ConnectedAccountProvider,
  type EmailConnectionParameters,
} from '@/types';

export type ConnectedAccountOperationFields = {
  provider: ConnectedAccountProvider;
  scopes?: string[] | null;
  connectionParameters?: EmailConnectionParameters | null;
};
