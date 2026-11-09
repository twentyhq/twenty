import { type Request } from 'express';

// Honors Express `trust proxy`
export const getRequestBaseUrl = (
  request: Pick<Request, 'protocol' | 'get'>,
): string => `${request.protocol}://${request.get('host')}`;
