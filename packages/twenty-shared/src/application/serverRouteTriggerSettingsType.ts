import { type HTTPMethod } from '@/types';

export type ServerRouteTriggerSettings = {
  forwardedRequestHeaders?: string[];
  httpMethods?: (HTTPMethod | `${HTTPMethod}`)[];
};
