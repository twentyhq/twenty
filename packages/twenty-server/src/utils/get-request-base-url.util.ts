import { type Request } from 'express';

// Absolute origin the request arrived on (honors Express `trust proxy`).
export const getRequestBaseUrl = (request: Request): string =>
  `${request.protocol}://${request.get('host')}`;
