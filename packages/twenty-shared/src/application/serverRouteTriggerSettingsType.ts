import { type HTTPMethod } from '@/types';

export type ServerRouteBearerTokenVerification = {
  jwksUrl: string;
  issuer: string;
  audienceServerVariable: string;
  requiredKeyEndorsement?: string;
};

export type ServerRouteTriggerSettings = {
  forwardedRequestHeaders?: string[];
  httpMethods?: HTTPMethod[];
  bearerTokenVerification?: ServerRouteBearerTokenVerification;
};
