import { type Lambda } from '@aws-sdk/client-lambda';

export type FlociLambdaDriver = {
  lambdaClient: Lambda;
  resourceNamespace: string;
  restore: () => Promise<void>;
};
