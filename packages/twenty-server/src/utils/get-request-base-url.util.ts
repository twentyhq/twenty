import { type Request } from 'express';

// Honors Express `trust proxy`
export const getRequestBaseUrl = (request: Request): string =>
  `${request.protocol}://${request.get('host')}`;
